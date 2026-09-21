"""Authenticated project, analytics, administration and import/export API."""
import csv
import io
from collections import Counter
from datetime import datetime, timedelta, timezone, date
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from sqlalchemy import or_, func
from sqlalchemy.orm import Session
from pydantic import ValidationError
from app import models as m
from app.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, hash_password, verify_password, create_access_token, oauth2_scheme, decode_access_token
from app.schemas import LoginRequest, LoginResponse, UserOut
from app.contracts import ProjectInput, ProjectPatch, UserInput, GrantInput, AgencyInput, ConstituencyInput, MilestoneInput, GapInput
from app.access import project_query, get_project, require, role, MANAGERS, GLOBAL, OFFICER, AGENCY, constituency_ids, check_constituency, audit
from app.services import project_out, create_project, score, analyze, kpis, agency_out
from app.operational_models import AccessGrant, AnalysisSnapshot, AuditEvent, LoginAttempt, RevokedToken, Evidence

router = APIRouter()
Auth = Depends(get_current_user)
DB = Depends(get_db)

@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = DB):
    username = payload.username[:100]
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=10)
    db.query(LoginAttempt).filter(LoginAttempt.created_at < cutoff).delete()
    if db.query(LoginAttempt).filter(LoginAttempt.username == username).count() >= 10:
        db.commit()
        raise HTTPException(429, "Too many failed attempts. Try again in ten minutes.")
    user = db.query(m.User).filter_by(username=username).first()
    if not user or not user.is_active or len(payload.password.encode()) > 72 or not verify_password(payload.password, user.hashed_password):
        db.add(LoginAttempt(username=username))
        db.commit()
        raise HTTPException(401, "Incorrect username or password")
    db.query(LoginAttempt).filter_by(username=username).delete()
    audit(db, user, "auth.login")
    db.commit()
    return LoginResponse(access_token=create_access_token({"sub": user.username}),
                         role=user.role.value, display_name=user.display_name)

@router.get("/auth/me", response_model=UserOut)
def me(user=Auth):
    return user

def revoke(db, token):
    payload = decode_access_token(token)
    if not db.get(RevokedToken, payload["jti"]):
        db.add(RevokedToken(jti=payload["jti"], expires_at=datetime.fromtimestamp(payload["exp"], timezone.utc).replace(tzinfo=None)))

@router.post("/auth/logout", status_code=204)
def logout(token: str = Depends(oauth2_scheme), user=Auth, db: Session = DB):
    revoke(db, token)
    audit(db, user, "auth.logout")
    db.commit()

@router.post("/auth/refresh", response_model=LoginResponse)
def refresh(token: str = Depends(oauth2_scheme), user=Auth, db: Session = DB):
    revoke(db, token)
    db.commit()
    return LoginResponse(access_token=create_access_token({"sub": user.username}),
                         role=user.role.value, display_name=user.display_name)

@router.post("/auth/register", response_model=UserOut, status_code=201)
def register(payload: UserInput, user=Auth, db: Session = DB):
    require(user, {"Admin"})
    if db.query(m.User).filter_by(username=payload.username).first():
        raise HTTPException(409, "Username already exists")
    if payload.constituency_id is not None and not db.get(m.Constituency, payload.constituency_id):
        raise HTTPException(422, "Unknown constituency")
    record = m.User(username=payload.username, hashed_password=hash_password(payload.password),
                    display_name=payload.display_name, role=m.UserRoleEnum(payload.role.value),
                    constituency_id=payload.constituency_id)
    db.add(record)
    db.flush()
    audit(db, user, "user.created", userId=record.id)
    db.commit()
    return record

@router.get("/users", response_model=list[UserOut])
def users(user=Auth, db: Session = DB):
    require(user, MANAGERS)
    query = db.query(m.User)
    if role(user) not in GLOBAL:
        ids = constituency_ids(db, user)
        granted = db.query(AccessGrant.user_id).filter(AccessGrant.constituency_id.in_(ids))
        query = query.filter(or_(m.User.constituency_id.in_(ids), m.User.id.in_(granted)))
    return query.order_by(m.User.id).all()

@router.post("/users/{user_id}/grants", status_code=201)
def grant(user_id: int, payload: GrantInput, user=Auth, db: Session = DB):
    require(user, {"Admin"})
    if not db.get(m.User, user_id) or not db.get(m.Constituency, payload.constituency_id):
        raise HTTPException(422, "Unknown user or constituency")
    if payload.agency_id is not None and not db.get(m.Agency, payload.agency_id):
        raise HTTPException(422, "Unknown agency")
    existing = db.query(AccessGrant).filter_by(user_id=user_id, **payload.model_dump()).first()
    if not existing:
        db.add(AccessGrant(user_id=user_id, **payload.model_dump()))
        audit(db, user, "access.granted", userId=user_id, **payload.model_dump())
        db.commit()
    return {"status": "granted"}

@router.get("/projects")
def projects(user=Auth, db: Session = DB, page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100),
             search: str = "", constituency: str = "", status: str = "", sector: str = "",
             risk_level: str = "", sort_by: str = "ai_score", order: str = "desc"):
    q = project_query(db, user)
    if search:
        q = q.filter(or_(m.Project.name.ilike(f"%{search}%"), m.Project.code.ilike(f"%{search}%")))
    if constituency:
        q = q.filter(m.Project.constituency.ilike(f"%{constituency}%"))
    for key, value, enum in [("status", status, m.ProjectStatusEnum), ("risk_level", risk_level, m.RiskLevelEnum)]:
        if value:
            try:
                q = q.filter(getattr(m.Project, key) == enum(value))
            except ValueError:
                raise HTTPException(422, f"Invalid {key}")
    if sector:
        q = q.filter(m.Project.sector == sector)
    if sort_by not in {"ai_score", "name", "expected_end_date", "physical_progress_pct", "expenditure_cr"} or order not in {"asc", "desc"}:
        raise HTTPException(422, "Unsupported sort")
    total = q.count()
    column = getattr(m.Project, sort_by)
    items = q.order_by(column.asc() if order == "asc" else column.desc(), m.Project.id).offset((page-1)*per_page).limit(per_page)
    return {"items": [project_out(p) for p in items], "total": total, "page": page,
            "perPage": per_page, "pages": max(1, (total + per_page - 1) // per_page)}

@router.get("/projects/all")
def all_projects(user=Auth, db: Session = DB):
    return [project_out(p) for p in project_query(db, user).order_by(m.Project.id).limit(10000)]

@router.get("/projects/priority-queue")
def priority(user=Auth, db: Session = DB, limit: int = Query(20, ge=1, le=100)):
    return [dict(project_out(p), explanations=analyze(p)["explanations"])
            for p in project_query(db, user).order_by(m.Project.ai_score.desc(), m.Project.id).limit(limit)]

@router.post("/projects", status_code=201)
def add_project(payload: ProjectInput, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    project = create_project(db, user, payload)
    db.commit()
    return project_out(project)

@router.get("/projects/{project_id}")
def project(project_id: int, user=Auth, db: Session = DB):
    return project_out(get_project(db, user, project_id))

@router.patch("/projects/{project_id}")
def update(project_id: int, payload: ProjectPatch, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    p = get_project(db, user, project_id)
    values = payload.model_dump(exclude_unset=True)
    # Validate combined state, including values omitted by a partial update.
    if values.get("expected_end_date", p.expected_end_date) <= p.start_date:
        raise HTTPException(422, "End date must be after start date")
    spent, released = values.get("expenditure_cr", p.expenditure_cr), values.get("released_amount_cr", p.released_amount_cr)
    if spent > released or released > p.sanctioned_amount_cr:
        raise HTTPException(422, "Require expenditure <= released <= sanctioned")
    if "status" in values:
        values["status"] = m.ProjectStatusEnum(values["status"].value)
    for key, value in values.items():
        setattr(p, key, value)
    p.financial_progress_pct = round(100 * p.expenditure_cr / p.sanctioned_amount_cr, 2)
    p.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.flush()
    score(db, p)
    audit(db, user, "project.updated", p.id, fields=list(values))
    db.commit()
    return project_out(p)

@router.delete("/projects/{project_id}", status_code=204)
def delete(project_id: int, user=Auth, db: Session = DB):
    require(user, {"Admin"})
    p = get_project(db, user, project_id)
    p.is_deleted = True
    audit(db, user, "project.deleted", p.id)
    db.commit()

@router.get("/projects/{project_id}/ai-analysis")
def analysis(project_id: int, user=Auth, db: Session = DB):
    return analyze(get_project(db, user, project_id))

@router.post("/ai/projects/{project_id}/rescore")
def rescore(project_id: int, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    result = score(db, get_project(db, user, project_id))
    audit(db, user, "analysis.created", project_id)
    db.commit()
    return result

@router.post("/ai/rescore-all")
def rescore_all(user=Auth, db: Session = DB):
    require(user, MANAGERS)
    count = 0
    for p in project_query(db, user):
        score(db, p)
        count += 1
    audit(db, user, "analysis.batch", count=count)
    db.commit()
    return {"scored": count}

@router.get("/projects/{project_id}/analysis-history")
def history(project_id: int, user=Auth, db: Session = DB):
    get_project(db, user, project_id)
    rows = db.query(AnalysisSnapshot).filter_by(project_id=project_id).order_by(AnalysisSnapshot.id.desc()).limit(100)
    return [{"id": s.id, "createdAt": s.created_at, "inputs": s.inputs, "result": s.result} for s in rows]

@router.get("/projects/{project_id}/timeline")
def timeline(project_id: int, user=Auth, db: Session = DB):
    get_project(db, user, project_id)
    return [{"id": t.id, "label": t.label, "date": t.date, "status": t.status.value}
            for t in db.query(m.ProjectMilestone).filter_by(project_id=project_id).order_by(m.ProjectMilestone.date)]

@router.post("/projects/{project_id}/timeline", status_code=201)
def milestone(project_id: int, payload: MilestoneInput, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    get_project(db, user, project_id)
    item = m.ProjectMilestone(project_id=project_id, label=payload.label, date=payload.date, status=m.MilestoneStatusEnum(payload.status))
    db.add(item)
    audit(db, user, "milestone.created", project_id, label=payload.label)
    db.commit()
    return {"id": item.id}

@router.get("/projects/{project_id}/financial-trend")
def financial_trend(project_id: int, user=Auth, db: Session = DB):
    get_project(db, user, project_id)
    return [{"quarter": t.quarter, "cumulative": t.cumulative, "expected": t.expected}
            for t in db.query(m.ProjectFinancialTrend).filter_by(project_id=project_id).order_by(m.ProjectFinancialTrend.id)]

@router.get("/projects/{project_id}/radar")
def radar(project_id: int, user=Auth, db: Session = DB):
    p = get_project(db, user, project_id)
    return [{"metric": k, "value": v} for k, v in [
        ("Financial Progress", p.financial_progress_pct), ("Physical Progress", p.physical_progress_pct),
        ("Timeline Adherence", p.timeline_adherence_pct), ("Update Consistency", p.update_consistency_pct),
        ("Pending Approvals", max(0, 100-p.pending_approvals*20)), ("Project Health", analyze(p)["aiHealthScore"])]]

@router.get("/dashboard/kpis")
def dashboard(user=Auth, db: Session = DB):
    return kpis(project_query(db, user).all())

@router.get("/dashboard/sector-distribution")
def sectors(user=Auth, db: Session = DB):
    counts = Counter(p.sector for p in project_query(db, user))
    total = sum(counts.values())
    return [{"sector": k, "value": v, "pct": round(v/total*100, 1), "color": "#2563eb"} for k, v in counts.items()]

@router.get("/dashboard/top-issues")
def issues(user=Auth, db: Session = DB):
    return [{"id": str(p.id), "title": r["factor"], "meta": p.name, "severity": r["severity"]}
            for p in project_query(db, user).order_by(m.Project.ai_score.desc()).limit(20)
            for r in analyze(p)["explanations"]]

@router.get("/dashboard/ai-insights")
def insights(user=Auth, db: Session = DB):
    k = kpis(project_query(db, user).all())
    return [{"id": "overdue", "tone": "warning" if k["delayed"] else "info",
             "text": f'{k["delayed"]} of {k["totalProjects"]} visible projects are past their completion date and incomplete.'}]

@router.get("/agencies")
def agencies(user=Auth, db: Session = DB):
    ps = project_query(db, user).all()
    ids = {p.agency_id for p in ps}
    query = db.query(m.Agency)
    if role(user) not in GLOBAL:
        query = query.filter(m.Agency.id.in_(ids))
    return [agency_out(a, [p for p in ps if p.agency_id == a.id]) for a in query.order_by(m.Agency.id)]

@router.post("/agencies", status_code=201)
def add_agency(payload: AgencyInput, user=Auth, db: Session = DB):
    require(user, {"Admin"})
    if db.query(m.Agency).filter_by(name=payload.name).first():
        raise HTTPException(409, "Agency exists")
    a = m.Agency(name=payload.name)
    db.add(a)
    audit(db, user, "agency.created", name=payload.name)
    db.commit()
    return agency_out(a, [])

@router.get("/agencies/{agency_id}")
def agency(agency_id: int, user=Auth, db: Session = DB):
    match = next((a for a in agencies(user, db) if a["id"] == str(agency_id)), None)
    if match is None:
        raise HTTPException(404, "Agency not found")
    return match

@router.get("/agencies/{agency_id}/projects")
def agency_projects(agency_id: int, user=Auth, db: Session = DB):
    agency(agency_id, user, db)
    return [project_out(p) for p in project_query(db, user).filter(m.Project.agency_id == agency_id)]

def visible_constituencies(db, user):
    q = db.query(m.Constituency)
    if role(user) in GLOBAL:
        return q
    if role(user) in {OFFICER, AGENCY}:
        return q.filter(m.Constituency.id.in_(project_query(db, user).with_entities(m.Project.constituency_id)))
    return q.filter(m.Constituency.id.in_(constituency_ids(db, user)))

def visible_constituency(db, user, cid):
    c = visible_constituencies(db, user).filter(m.Constituency.id == cid).first()
    if not c:
        raise HTTPException(404, "Constituency not found")
    return c

@router.get("/constituencies")
def constituencies(user=Auth, db: Session = DB):
    return [{"id": c.id, "name": c.name, "state": c.state, "district": c.district} for c in visible_constituencies(db, user)]

@router.post("/constituencies", status_code=201)
def add_constituency(payload: ConstituencyInput, user=Auth, db: Session = DB):
    require(user, {"Admin"})
    c = m.Constituency(**payload.model_dump())
    db.add(c)
    audit(db, user, "constituency.created", name=c.name)
    db.commit()
    return {"id": c.id, **payload.model_dump()}

@router.get("/constituencies/{cid}")
def constituency(cid: int, user=Auth, db: Session = DB):
    c = visible_constituency(db, user, cid)
    return {"id": c.id, "name": c.name, "state": c.state, "district": c.district}

@router.get("/constituencies/{cid}/kpis")
def constituency_kpis(cid: int, user=Auth, db: Session = DB):
    visible_constituency(db, user, cid)
    return kpis(project_query(db, user).filter(m.Project.constituency_id == cid).all())

@router.get("/constituencies/{cid}/sector-gaps")
def gaps(cid: int, user=Auth, db: Session = DB):
    visible_constituency(db, user, cid)
    # Only return measurements entered with a source in this API, not legacy seeded illustrative numbers.
    events = db.query(AuditEvent).filter_by(action="coverage.recorded").order_by(AuditEvent.id.desc()).all()
    latest = {}
    for e in events:
        d = e.detail
        if d["constituencyId"] == cid and d["sector"] not in latest:
            latest[d["sector"]] = d
    return list(latest.values())

@router.post("/constituencies/{cid}/sector-gaps")
def record_gap(cid: int, payload: GapInput, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    visible_constituency(db, user, cid)
    pct = round((payload.need-payload.covered)/payload.need*100, 1)
    value = {"constituencyId": cid, **payload.model_dump(mode="json", by_alias=True),
             "gapPct": pct, "gapLevel": "High" if pct >= 50 else "Medium" if pct >= 25 else "Low"}
    audit(db, user, "coverage.recorded", **value)
    db.commit()
    return value

@router.get("/constituencies/{cid}/ward-gaps")
@router.get("/constituencies/{cid}/investment-trend")
@router.get("/constituencies/{cid}/recommendations")
def unavailable_constituency_analysis(cid: int, user=Auth, db: Session = DB):
    visible_constituency(db, user, cid)
    return []

@router.get("/reports/fund-utilization")
def fund_report(user=Auth, db: Session = DB):
    ps = project_query(db, user).all()
    return {"totalSanctionedCr": sum(p.sanctioned_amount_cr for p in ps),
            "totalReleasedCr": sum(p.released_amount_cr for p in ps),
            "totalExpenditureCr": sum(p.expenditure_cr for p in ps), **kpis(ps)}

@router.get("/reports/project-status")
def status_report(user=Auth, db: Session = DB):
    ps = project_query(db, user).all()
    return {"total": len(ps), "statuses": dict(Counter(p.status.value for p in ps))}

def csv_safe(value):
    text = str(value)
    return "'" + text if text.lstrip().startswith(("=", "+", "-", "@", "\t", "\r")) else text

@router.get("/reports/export")
def export(user=Auth, db: Session = DB):
    stream = io.StringIO(newline="")
    writer = csv.writer(stream)
    writer.writerow(["code", "name", "constituency", "agency", "sanctioned_cr", "spent_cr", "physical_progress_pct", "priority_score"])
    for p in project_query(db, user).order_by(m.Project.id):
        writer.writerow([csv_safe(x) for x in [p.code, p.name, p.constituency, p.agency, p.sanctioned_amount_cr,
                                               p.expenditure_cr, p.physical_progress_pct, p.ai_score]])
    return Response(stream.getvalue(), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="projects.csv"'})

@router.get("/imports/template")
def import_template(user=Auth):
    require(user, MANAGERS)
    header = "code,name,sector,constituency_id,agency_id,lat,lng,status,sanctioned_amount_cr,released_amount_cr,expenditure_cr,physical_progress_pct,start_date,expected_end_date\n"
    return Response(header, media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="import-template.csv"'})

@router.post("/imports/projects")
async def import_projects(file: UploadFile = File(...), user=Auth, db: Session = DB):
    require(user, MANAGERS)
    raw = await file.read(1024*1024+1)
    await file.close()
    if len(raw) > 1024*1024:
        raise HTTPException(413, "CSV limit is 1 MB")
    try:
        rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8-sig"))))
    except (UnicodeError, csv.Error):
        raise HTTPException(422, "Upload a UTF-8 CSV")
    if not rows or len(rows) > 2000:
        raise HTTPException(422, "Provide between 1 and 2000 rows")
    created = updated = 0
    seen = set()
    for index, row in enumerate(rows, 2):
        try:
            cid, aid = int(row["constituency_id"]), int(row["agency_id"])
            c, a = db.get(m.Constituency, cid), db.get(m.Agency, aid)
            if not c or not a:
                raise ValueError("Unknown constituency or agency")
            if row["code"] in seen:
                raise ValueError("Duplicate project code in this CSV")
            seen.add(row["code"])
            payload = ProjectInput(**{**row, "constituency": c.name, "state": c.state, "district": c.district,
                                     "agency": a.name, "financial_progress_pct": 0,
                                     "location": {"lat": row["lat"], "lng": row["lng"]}})
            check_constituency(db, user, cid)
            p = db.query(m.Project).filter_by(code=payload.code).first()
            if p:
                get_project(db, user, p.id)
                values = payload.model_dump(exclude={"location"})
                values.update(lat=payload.location.lat, lng=payload.location.lng,
                              status=m.ProjectStatusEnum(payload.status.value),
                              financial_progress_pct=round(payload.expenditure_cr / payload.sanctioned_amount_cr*100, 2))
                for key, value in values.items():
                    setattr(p, key, value)
                p.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
                db.flush()
                score(db, p)
                audit(db, user, "project.imported", p.id)
                updated += 1
            else:
                create_project(db, user, payload)
                created += 1
        except (ValueError, KeyError, ValidationError) as exc:
            db.rollback()
            raise HTTPException(422, f"Row {index}: invalid or missing project fields ({str(exc)[:250]}). No rows imported.")
    db.commit()
    return {"created": created, "updated": updated}

@router.get("/audit")
def audit_log(project_id: int | None = None, user=Auth, db: Session = DB):
    if project_id is not None:
        get_project(db, user, project_id)
    q = db.query(AuditEvent)
    if role(user) not in GLOBAL:
        q = q.filter(AuditEvent.project_id.in_(project_query(db, user).with_entities(m.Project.id)))
    if project_id is not None:
        q = q.filter_by(project_id=project_id)
    return [{"id": e.id, "actorId": e.actor_id, "projectId": e.project_id, "action": e.action,
             "detail": e.detail, "createdAt": e.created_at} for e in q.order_by(AuditEvent.id.desc()).limit(200)]
