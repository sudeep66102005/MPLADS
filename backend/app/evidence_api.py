"""Private, bounded image ingestion. Never fetch arbitrary URLs supplied by clients."""
import hashlib
import io
import math
import uuid
import warnings
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.core.config import settings
from app.core.security import get_current_user
from app.database import get_db
from app.access import get_project, project_query, require, MANAGERS, OFFICER, AGENCY, audit
from app.operational_models import Evidence, EvidenceContent
from app.models import Project

router = APIRouter()
Image.MAX_IMAGE_PIXELS = 20_000_000

def distance(lat1, lng1, lat2, lng2):
    a, b = math.radians(lat1), math.radians(lat2)
    dlat, dlng = b-a, math.radians(lng2-lng1)
    h = math.sin(dlat/2)**2 + math.cos(a)*math.cos(b)*math.sin(dlng/2)**2
    return round(6371 * 2 * math.asin(min(1, math.sqrt(h))), 3)

def inspect_image(raw):
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(raw)) as probe:
                fmt = probe.format
                if fmt not in {"JPEG", "PNG", "WEBP"}:
                    raise ValueError("Only JPEG, PNG and WebP images are accepted")
                probe.verify()
            with Image.open(io.BytesIO(raw)) as original:
                im = ImageOps.exif_transpose(original).convert("L").resize((9, 8))
                pixels = list(im.get_flattened_data())
                bits = 0
                for y in range(8):
                    for x in range(8):
                        bits = (bits << 1) | int(pixels[y*9+x] > pixels[y*9+x+1])
        return fmt, f"{bits:016x}"
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(422, "Invalid, unsupported or oversized image")

def evidence_out(e, matches=None):
    return {"id": e.id, "projectId": e.project_id, "caption": e.caption, "sha256": e.sha256,
            "size": e.size, "createdAt": e.created_at, "distanceKm": e.distance_km,
            "locationStatus": (e.content.details.get("locationSource") if e.content else None) or ("not supplied" if e.lat is None else "user/device supplied; not proof of capture location"),
            "filePath": f"/api/v1/evidence/{e.id}/file",
            "duplicateCandidates": matches or [], "verifiedProgressPct": None}

def duplicate_matches(db, user, e):
    allowed = project_query(db, user).with_entities(Project.id)
    candidates = db.query(Evidence).filter(Evidence.project_id.in_(allowed), Evidence.id != e.id).all()
    matches = []
    for other in candidates:
        delta = (int(e.perceptual_hash, 16) ^ int(other.perceptual_hash, 16)).bit_count()
        exact = e.sha256 == other.sha256
        if exact or (delta <= 5 and e.perceptual_hash not in {"0000000000000000", "ffffffffffffffff"}):
            matches.append({"evidenceId": other.id, "projectId": other.project_id, "exact": exact,
                            "similarity": round(1-delta/64, 3), "requiresHumanReview": True})
    return matches[:50]

@router.post("/projects/{project_id}/photos", status_code=201)
async def upload(project_id: int, file: UploadFile = File(...), request_key: str = Form(...),
                 caption: str = Form(""), lat: float | None = Form(None), lng: float | None = Form(None),
                 user=Depends(get_current_user), db: Session = Depends(get_db)):
    require(user, MANAGERS | {OFFICER, AGENCY})
    project = get_project(db, user, project_id)
    if not 8 <= len(request_key) <= 80 or len(caption) > 2000:
        raise HTTPException(422, "Invalid request key or caption")
    if (lat is None) != (lng is None) or (lat is not None and (not -90 <= lat <= 90 or not -180 <= lng <= 180)):
        raise HTTPException(422, "Provide valid latitude and longitude together")
    raw = await file.read(settings.MAX_UPLOAD_BYTES + 1)
    await file.close()
    if len(raw) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image exceeds upload limit")
    digest = hashlib.sha256(raw).hexdigest()
    previous = db.query(Evidence).filter_by(uploaded_by=user.id, request_key=request_key).first()
    if previous:
        if previous.project_id != project_id or previous.sha256 != digest or previous.caption != caption or previous.lat != lat or previous.lng != lng:
            raise HTTPException(409, "Request key already used for different evidence")
        return evidence_out(previous, duplicate_matches(db, user, previous))
    if settings.EVIDENCE_STORAGE == "database":
        if db.bind.dialect.name == "postgresql":
            db.execute(text("SELECT pg_advisory_xact_lock(741852963)"))
        used = db.query(func.coalesce(func.sum(Evidence.size), 0)).scalar()
        if used + len(raw) > settings.EVIDENCE_QUOTA_BYTES:
            raise HTTPException(413, "Evidence storage quota reached. Export records and ask the administrator to review storage.")
    fmt, phash = inspect_image(raw)
    ext, mime = {"JPEG": ("jpg", "image/jpeg"), "PNG": ("png", "image/png"), "WEBP": ("webp", "image/webp")}[fmt]
    filename = f"{uuid.uuid4().hex}.{ext}"
    directory = Path(settings.UPLOAD_DIR).resolve()
    if settings.EVIDENCE_STORAGE == "filesystem":
        directory.mkdir(parents=True, exist_ok=True)
    target = directory / filename
    e = Evidence(project_id=project_id, uploaded_by=user.id, request_key=request_key, filename=filename,
                 sha256=digest, perceptual_hash=phash, mime_type=mime, size=len(raw), caption=caption,
                 lat=lat, lng=lng, distance_km=distance(lat, lng, project.lat, project.lng) if lat is not None else None)
    try:
        if settings.EVIDENCE_STORAGE == "filesystem":
            with target.open("xb") as stream:
                stream.write(raw)
        db.add(e)
        db.flush()
        db.add(EvidenceContent(evidence_id=e.id, payload=raw if settings.EVIDENCE_STORAGE == "database" else None,
                              details={"locationSource": "not supplied" if lat is None else "user/device supplied; not proof of capture location"}))
        audit(db, user, "evidence.uploaded", project_id, evidenceId=e.id, sha256=digest)
        db.commit()
    except Exception:
        db.rollback()
        if settings.EVIDENCE_STORAGE == "filesystem":
            target.unlink(missing_ok=True)
        raise
    return evidence_out(e, duplicate_matches(db, user, e))

@router.get("/projects/{project_id}/photos")
def photos(project_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    get_project(db, user, project_id)
    return [evidence_out(e, duplicate_matches(db, user, e))
            for e in db.query(Evidence).filter_by(project_id=project_id).order_by(Evidence.id.desc())]

@router.get("/evidence/{evidence_id}/file")
def download(evidence_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    e = db.get(Evidence, evidence_id)
    if not e:
        raise HTTPException(404, "Evidence not found")
    get_project(db, user, e.project_id)
    if e.content is not None and e.content.payload is not None:
        return Response(e.content.payload, media_type=e.mime_type,
                        headers={"Content-Disposition": f'attachment; filename="evidence-{e.id}{Path(e.filename).suffix}"',
                                 "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})
    path = Path(settings.UPLOAD_DIR).resolve() / e.filename
    if not path.is_file() or path.parent != Path(settings.UPLOAD_DIR).resolve():
        raise HTTPException(404, "Evidence file unavailable")
    return FileResponse(path, media_type=e.mime_type, filename=f"evidence-{e.id}{path.suffix}",
                        headers={"Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})
