"""Shared boundaries for record reads, exports, aggregates and writes."""
from fastapi import HTTPException
from sqlalchemy import or_, and_, false
from app.models import Project, InspectionReport
from app.operational_models import AccessGrant, AuditEvent

GLOBAL = {"Admin", "MoSPI / Central Nodal Agency"}
MANAGERS = GLOBAL | {"District Nodal Authority", "State Nodal Authority"}
OFFICER = "Inspecting / Field Officer"
AGENCY = "Implementing Agency"

def role(user):
    return user.role.value

def require(user, roles):
    if role(user) not in roles:
        raise HTTPException(403, "Your role cannot perform this action")

def constituency_ids(db, user):
    ids = {g.constituency_id for g in db.query(AccessGrant).filter_by(user_id=user.id)}
    if user.constituency_id:
        ids.add(user.constituency_id)
    return ids

def project_query(db, user):
    query = db.query(Project).filter(Project.is_deleted.is_(False))
    if role(user) in GLOBAL:
        return query
    if role(user) == OFFICER:
        assigned = db.query(InspectionReport.project_id).filter_by(inspector_id=user.id)
        return query.filter(Project.id.in_(assigned))
    if role(user) == AGENCY:
        clauses = [and_(Project.constituency_id == g.constituency_id, Project.agency_id == g.agency_id)
                   for g in db.query(AccessGrant).filter_by(user_id=user.id) if g.agency_id]
        return query.filter(or_(*clauses) if clauses else false())
    return query.filter(Project.constituency_id.in_(constituency_ids(db, user)))

def get_project(db, user, project_id):
    project = project_query(db, user).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(404, "Project not found")
    return project

def check_constituency(db, user, cid):
    if role(user) not in GLOBAL and cid not in constituency_ids(db, user):
        raise HTTPException(404, "Constituency not found")

def audit(db, user, action, project_id=None, **detail):
    db.add(AuditEvent(actor_id=user.id, project_id=project_id, action=action, detail=detail))
