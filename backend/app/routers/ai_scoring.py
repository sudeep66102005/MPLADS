"""
Direct AI Engine endpoints.

Exposes the AI Engine's scoring primitives independently of the
project/agency resource routers above, for cases where a caller (e.g. a
batch job re-scoring all projects overnight) wants to invoke scoring
directly rather than through a resource-shaped endpoint.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app import mock_store
from app.ai_engine.scoring import analyze_project
from app.schemas import ProjectAiAnalysis

router = APIRouter()


@router.post("/projects/{project_id}/rescore", response_model=ProjectAiAnalysis)
def rescore_project(project_id: str) -> ProjectAiAnalysis:
    """Re-runs AI health/delay/anomaly scoring for a single project.

    In production this would be triggered by an eSAKSHI data-sync webhook
    or a scheduled batch job, and would persist the refreshed score back
    to the database rather than only returning it.
    """
    project = mock_store.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return analyze_project(project)
