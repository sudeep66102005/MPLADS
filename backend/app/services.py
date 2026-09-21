"""Deterministic, versioned monitoring rules; no trained-model claims."""
from datetime import date
from collections import Counter
from fastapi import HTTPException
from app import models as m
from app.operational_models import AnalysisSnapshot, ProjectRevision
from sqlalchemy.orm.attributes import flag_modified
from app.access import check_constituency, audit
from app.routers.projects import _project_to_out
from app.core.config import settings
from app.ai_engine.delay_model import predict

RULE_VERSION = "rules-1.0"

def project_out(project):
    out = _project_to_out(project).model_dump(mode="json", by_alias=True)
    out.update(agencyId=project.agency_id, constituencyId=project.constituency_id,
               updatedAt=project.updated_at.isoformat() if project.updated_at else None,
               analysisMethod="rule-based baseline",
               delayMetric="heuristic indicator, not calibrated probability")
    return out

def analyze(project, as_of=None):
    today = as_of or date.today()
    total_days = max(1, (project.expected_end_date - project.start_date).days)
    expected = min(100, max(0, 100 * (today - project.start_date).days / total_days))
    physical = project.physical_progress_pct
    gap = max(0, expected - physical)
    spend_gap = max(0, project.financial_progress_pct - physical)
    stale_days = max(0, (today - project.updated_at.date()).days) if project.updated_at else None
    reasons = []
    def flag(code, detail, severity):
        reasons.append({"factor": code, "detail": detail, "severity": severity})
    if spend_gap > 25:
        flag("Expenditure vs. Progress Mismatch", f"{project.financial_progress_pct:.1f}% spent versus {physical:.1f}% physical progress.", "High")
    if gap > 20 and physical < 100:
        flag("Behind expected schedule", f"Reported {physical:.1f}%; linear schedule baseline {expected:.1f}%. Validate against actual milestones.", "High")
    overdue = max(0, (today - project.expected_end_date).days) if physical < 100 else 0
    if overdue:
        flag("Completion date passed", f"Incomplete and {overdue} days past the recorded end date.", "High")
    if stale_days is not None and stale_days > 30:
        flag("Stale source record", f"No project record update in {stale_days} days; obtain current evidence.", "Medium")
    if project.pending_approvals >= 3:
        flag("Multiple Pending Approvals", f"{project.pending_approvals} approvals are pending.", "Medium")
    health = round(max(0, 100 - 0.55 * gap - 0.30 * spend_gap
                       - min(15, project.pending_approvals * 3)
                       - (10 if stale_days is not None and stale_days > 30 else 0)
                       - (10 if overdue else 0)), 1)
    risk = round(100 - health, 1)
    level = "Critical" if risk >= 75 else "High" if risk >= 50 else "Medium" if risk >= 25 else "Low"
    result = {"projectId": str(project.id), "aiHealthScore": health, "priorityScore": risk,
            "riskLevel": level, "delayRiskIndicator": round(min(100, gap * .8 + spend_gap * .2), 1),
            "delayProbabilityPct": None, "predictedDelayDays": None, "overdueDays": overdue,
            "expectedProgressPct": round(expected, 1), "verifiedProgressPct": None,
            "explanations": reasons, "ruleVersion": RULE_VERSION, "asOf": today.isoformat(),
            "method": "rule-based baseline", "limitations": [
                "Expected progress uses a linear schedule, not a project-specific construction model.",
                "No trained delay probability or image-derived completion percentage is available."]}
    if settings.DELAY_MODEL_PATH:
        try:
            prediction = predict(settings.DELAY_MODEL_PATH, project, today, settings.ENVIRONMENT == "production")
            result.update(delayPrediction=prediction, delayProbabilityPct=prediction["probabilityPct"],
                          predictedDelayDays=prediction["predictedDelayDays"])
            result["limitations"][-1] = "Delay estimates need domain validation; image-derived completion remains unavailable."
        except (OSError, ValueError, KeyError, TypeError):
            result["delayModelStatus"] = "Configured model unavailable or invalid; using rules only"
    return result

def score(db, project):
    result = analyze(project)
    # Cached legacy numeric fields are zero when a trained prediction is unavailable.
    project.ai_health_score = result["aiHealthScore"]
    project.ai_score = result["priorityScore"]
    project.risk_level = m.RiskLevelEnum(result["riskLevel"])
    project.delay_probability_pct = result["delayProbabilityPct"] or 0
    project.predicted_delay_days = result["predictedDelayDays"] or 0
    # Re-analysis must not make old source data look freshly updated.
    project.updated_at = project.updated_at
    flag_modified(project, "updated_at")
    inputs = {k: str(getattr(project, k)) for k in (
        "start_date", "expected_end_date", "physical_progress_pct", "financial_progress_pct",
        "pending_approvals", "updated_at")}
    db.add(AnalysisSnapshot(project_id=project.id, rule_version=RULE_VERSION, inputs=inputs, result=result))
    return result

def record_revision(db, user, project, source):
    db.add(ProjectRevision(project_id=project.id, actor_id=user.id, source=source,
                           values=project_out(project)))

def create_project(db, user, payload):
    check_constituency(db, user, payload.constituency_id)
    c = db.get(m.Constituency, payload.constituency_id)
    a = db.get(m.Agency, payload.agency_id)
    if c is None or a is None:
        raise HTTPException(422, "Unknown constituency or agency ID")
    if db.query(m.Project).filter_by(code=payload.code).first():
        raise HTTPException(409, "Project code already exists")
    data = payload.model_dump(exclude={"location", "constituency", "state", "district", "agency"})
    data.update(lat=payload.location.lat, lng=payload.location.lng, constituency=c.name,
                state=c.state, district=c.district, agency=a.name,
                status=m.ProjectStatusEnum(payload.status.value),
                financial_progress_pct=round(100 * payload.expenditure_cr / payload.sanctioned_amount_cr, 2))
    project = m.Project(**data)
    db.add(project)
    db.flush()
    score(db, project)
    record_revision(db, user, project, "created")
    audit(db, user, "project.created", project.id)
    return project

def kpis(projects):
    n = len(projects)
    allocated = sum(p.sanctioned_amount_cr for p in projects)
    spent = sum(p.expenditure_cr for p in projects)
    high = sum(p.risk_level.value in {"High", "Critical"} for p in projects)
    delayed = sum(p.physical_progress_pct < 100 and p.expected_end_date < date.today() for p in projects)
    return {"totalProjects": n, "totalProjectsYoY": None, "highRisk": high,
            "highRiskPct": round(high / n * 100, 1) if n else 0, "delayed": delayed,
            "delayedPct": round(delayed / n * 100, 1) if n else 0,
            "totalAllocationCr": round(allocated, 4), "expenditureCr": round(spent, 4),
            "fundUtilizationPct": round(spent / allocated * 100, 1) if allocated else 0,
            "developmentGaps": None}

def agency_out(agency, projects):
    n = len(projects)
    overdue = [max(0, (date.today() - p.expected_end_date).days) for p in projects if p.physical_progress_pct < 100]
    return {"id": str(agency.id), "name": agency.name, "projectsCount": n,
            "completionRatePct": round(100 * sum(p.physical_progress_pct >= 100 for p in projects) / n, 1) if n else 0,
            "avgDelayDays": round(sum(overdue) / len(overdue), 1) if overdue else 0,
            "delayDefinition": "Current overdue days among incomplete projects; not historical completion delay",
            "costVariationPct": None, "stalledProjects": None,
            "updateConsistencyPct": round(sum(p.update_consistency_pct for p in projects) / n, 1) if n else 0,
            "aiScore": round(sum(p.ai_health_score for p in projects) / n, 1) if n else 0}
