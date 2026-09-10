"""
Project endpoints.

Serves the Projects list, Map View pins, and Project Detail screens on the
dashboard. Backed by `app.mock_store` for now — swap for real
SQLAlchemy/PostGIS queries once the database is wired up (see
`app/mock_store.py` docstring for the intended seam).
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app import mock_store
from app.ai_engine.scoring import analyze_project
from app.schemas import ProjectAiAnalysis, ProjectOut

router = APIRouter()


@router.get("", response_model=list[ProjectOut])
def list_projects(
    constituency: str | None = Query(default=None),
    status: str | None = Query(default=None),
    risk_level: str | None = Query(default=None),
) -> list[dict]:
    """List projects, with optional filters mirroring the Projects page's
    filter bar (constituency, status, AI risk level)."""
    projects = mock_store.list_projects()

    if constituency:
        projects = [p for p in projects if constituency.lower() in p["constituency"].lower()]
    if status:
        projects = [p for p in projects if p["status"] == status]
    if risk_level:
        projects = [p for p in projects if p["risk_level"] == risk_level]

    return projects


@router.get("/priority-queue", response_model=list[ProjectOut])
def get_priority_queue(limit: int = Query(default=20, le=100)) -> list[dict]:
    """Backs the AI Priority Queue page — projects ordered by AI risk score
    descending (i.e. the ones that most need a human look first).

    NOTE: this fixed-path route MUST be declared before the `/{project_id}`
    route below, otherwise FastAPI/Starlette would match "priority-queue"
    as a project_id path parameter instead.
    """
    projects = sorted(mock_store.list_projects(), key=lambda p: p["ai_score"], reverse=True)
    return projects[:limit]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str) -> dict:
    project = mock_store.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}/ai-analysis", response_model=ProjectAiAnalysis)
def get_project_ai_analysis(project_id: str) -> ProjectAiAnalysis:
    """Powers the Project Detail page's "AI Analysis Summary" /
    "Detailed AI Analysis" panels — health score, delay prediction and
    anomaly explanations for a single project."""
    project = mock_store.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return analyze_project(project)
