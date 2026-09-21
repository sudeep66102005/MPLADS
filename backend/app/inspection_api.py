"""Inspection state machine with optimistic locking and idempotent assignment."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models as m
from app.database import get_db
from app.core.security import get_current_user
from app.access import get_project, project_query, constituency_ids, require, role, MANAGERS, OFFICER, audit
from app.contracts import AssignInspection, InspectionPatch, ReviewInput
from app.operational_models import InspectionWorkflow, Evidence
from app.services import analyze, project_out

router = APIRouter()
Auth = Depends(get_current_user)
DB = Depends(get_db)

def out(i, w):
    return {"id": i.id, "projectId": i.project_id, "inspectorId": i.inspector_id,
            "inspectionDate": i.inspection_date, "status": w.state, "version": w.version,
            "findings": i.findings or "", "physicalProgressObservedPct": i.physical_progress_observed_pct,
            "checklist": w.checklist, "evidenceIds": w.evidence_ids, "outcome": w.outcome,
            "reviewNote": w.review_note, "createdAt": i.created_at}

def get_pair(db, user, iid):
    i = db.get(m.InspectionReport, iid)
    if not i:
        raise HTTPException(404, "Inspection not found")
    get_project(db, user, i.project_id)
    if role(user) == OFFICER and i.inspector_id != user.id:
        raise HTTPException(404, "Inspection not found")
    w = db.get(InspectionWorkflow, iid)
    if not w:
        raise HTTPException(409, "Legacy inspection must be re-assigned through the new workflow")
    return i, w

def reserve(db, w, version):
    # Conditional UPDATE is atomic on PostgreSQL and SQLite; no silent lost edits.
    count = db.query(InspectionWorkflow).filter_by(inspection_id=w.inspection_id, version=version).update(
        {"version": version + 1}, synchronize_session=False)
    if count != 1:
        raise HTTPException(409, "Inspection changed. Reload before saving.")
    db.refresh(w)

@router.get("/inspections")
def inspections(user=Auth, db: Session = DB, project_id: int | None = None):
    q = db.query(m.InspectionReport).filter(m.InspectionReport.project_id.in_(project_query(db, user).with_entities(m.Project.id)))
    if role(user) == OFFICER:
        q = q.filter_by(inspector_id=user.id)
    if project_id is not None:
        q = q.filter_by(project_id=project_id)
    results = []
    for i in q.order_by(m.InspectionReport.id.desc()).limit(200):
        w = db.get(InspectionWorkflow, i.id)
        if w:
            results.append(out(i, w))
    return results

@router.post("/inspections", status_code=201)
def assign(payload: AssignInspection, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    p = get_project(db, user, payload.project_id)
    inspector = db.get(m.User, payload.inspector_id)
    if not inspector or not inspector.is_active or role(inspector) != OFFICER:
        raise HTTPException(422, "Choose an active field officer")
    if p.constituency_id not in constituency_ids(db, inspector):
        raise HTTPException(422, "Officer is not assigned to this constituency")
    key = f"{user.id}:{payload.request_key}"
    previous = db.query(InspectionWorkflow).filter_by(request_key=key).first()
    if previous:
        i, w = get_pair(db, user, previous.inspection_id)
        if (i.project_id, i.inspector_id, i.inspection_date) != (payload.project_id, payload.inspector_id, payload.inspection_date):
            raise HTTPException(409, "Request key already used for a different assignment")
        return out(i, w)
    i = m.InspectionReport(project_id=p.id, inspector_id=inspector.id, inspection_date=payload.inspection_date,
                            status=m.InspectionStatusEnum.scheduled)
    db.add(i)
    db.flush()
    w = InspectionWorkflow(inspection_id=i.id, request_key=key)
    db.add(w)
    audit(db, user, "inspection.assigned", p.id, inspectionId=i.id, inspectorId=inspector.id)
    db.commit()
    return out(i, w)

@router.get("/inspections/{iid}")
def detail(iid: int, user=Auth, db: Session = DB):
    i, w = get_pair(db, user, iid)
    return out(i, w)

@router.get("/inspections/{iid}/dossier")
def dossier(iid: int, user=Auth, db: Session = DB):
    i, w = get_pair(db, user, iid)
    p = get_project(db, user, i.project_id)
    return {"inspection": out(i, w), "project": project_out(p), "analysis": analyze(p),
            "recommendedChecks": ["Confirm site and project identity", "Inspect reported physical progress",
                                  "Compare uploaded evidence", "Record explanations and supporting records"]}

def save_draft(iid, payload, user, db, submit=False):
    i, w = get_pair(db, user, iid)
    if role(user) != OFFICER or i.inspector_id != user.id:
        raise HTTPException(403, "Only the assigned field officer may record findings")
    if w.state not in {"Assigned", "Draft", "Needs clarification", "Reopened"}:
        raise HTTPException(409, "This inspection is not editable")
    for eid in payload.evidence_ids:
        e = db.get(Evidence, eid)
        if not e or e.project_id != i.project_id:
            raise HTTPException(422, "Evidence must belong to the inspected project")
    if submit and (len(payload.findings.strip()) < 10 or payload.physical_progress_observed_pct is None):
        raise HTTPException(422, "Submission requires findings and observed progress")
    reserve(db, w, payload.version)
    i.findings = payload.findings
    i.physical_progress_observed_pct = payload.physical_progress_observed_pct
    i.status = m.InspectionStatusEnum.in_progress
    w.checklist, w.evidence_ids = payload.checklist, list(dict.fromkeys(payload.evidence_ids))
    w.state = "Submitted" if submit else "Draft"
    audit(db, user, "inspection.submitted" if submit else "inspection.draft_saved", i.project_id, inspectionId=i.id, version=w.version)
    db.commit()
    return out(i, w)

@router.patch("/inspections/{iid}")
def draft(iid: int, payload: InspectionPatch, user=Auth, db: Session = DB):
    return save_draft(iid, payload, user, db)

@router.post("/inspections/{iid}/submit")
def submit(iid: int, payload: InspectionPatch, user=Auth, db: Session = DB):
    return save_draft(iid, payload, user, db, True)

@router.post("/inspections/{iid}/review")
def review(iid: int, payload: ReviewInput, user=Auth, db: Session = DB):
    require(user, MANAGERS)
    i, w = get_pair(db, user, iid)
    if (payload.decision == "Reopened" and w.state != "Closed") or (payload.decision != "Reopened" and w.state != "Submitted"):
        raise HTTPException(409, "Invalid review transition")
    if payload.decision == "Closed" and payload.outcome == "Needs evidence":
        raise HTTPException(422, "Request clarification when more evidence is needed")
    reserve(db, w, payload.version)
    w.state, w.outcome, w.review_note = payload.decision, payload.outcome, payload.note
    i.status = m.InspectionStatusEnum.completed if w.state == "Closed" else m.InspectionStatusEnum.in_progress
    audit(db, user, "inspection.reviewed", i.project_id, inspectionId=i.id, decision=w.state, outcome=w.outcome, note=w.review_note)
    db.commit()
    return out(i, w)
