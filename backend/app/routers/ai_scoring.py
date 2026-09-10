"""
Direct AI Engine endpoints.

Exposes the AI Engine's scoring primitives independently of the
project/agency resource routers, for batch rescoring and direct
AI engine access.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai_engine.scoring import analyze_project_from_model, score_all_projects
from app.database import get_db
from app.models import Project
from app.schemas import ProjectAiAnalysis

router = APIRouter()


@router.post("/projects/{project_id}/rescore", response_model=ProjectAiAnalysis)
def rescore_project(project_id: str, db: Session = Depends(get_db)) -> ProjectAiAnalysis:
    """Re-runs AI health/delay/anomaly scoring for a single project and
    persists the updated score."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = analyze_project_from_model(project)

    # Persist updated scores
    project.ai_health_score = analysis.ai_health_score
    project.delay_probability_pct = analysis.delay_probability_pct
    project.predicted_delay_days = analysis.predicted_delay_days
    project.ai_score = round(100 - analysis.ai_health_score, 1)
    db.commit()

    return analysis


@router.post("/rescore-all")
def rescore_all_projects(db: Session = Depends(get_db)):
    """Batch re-score all projects. In production this would be triggered
    by a scheduled job or data-sync webhook."""
    count = score_all_projects(db)
    return {"status": "ok", "projects_scored": count}
