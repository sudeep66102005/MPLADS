"""
Project endpoints.

Serves the Projects list, Map View pins, Project Detail, and related
sub-resources (timeline, photos, financial trend). Backed by SQLAlchemy
queries against PostgreSQL.
"""

from __future__ import annotations

import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session

from app.ai_engine.scoring import analyze_project_from_model
from app.database import get_db
from app.models import Project, ProjectMilestone, ProjectPhoto, ProjectFinancialTrend
from app.schemas import (
    FinancialTrendPointOut,
    GeoPoint,
    PaginatedResponse,
    ProjectAiAnalysis,
    ProjectCreate,
    ProjectMilestoneOut,
    ProjectOut,
    ProjectPhotoOut,
    ProjectRadarPoint,
    ProjectUpdate,
    RiskIndicatorOut,
)

router = APIRouter()


def _project_to_out(p: Project) -> ProjectOut:
    """Convert a SQLAlchemy Project instance to a ProjectOut schema."""
    return ProjectOut(
        id=str(p.id),
        code=p.code,
        name=p.name,
        sector=p.sector,
        constituency=p.constituency,
        state=p.state,
        district=p.district,
        location=GeoPoint(lat=p.lat, lng=p.lng),
        agency=p.agency,
        status=p.status.value,
        risk_level=p.risk_level.value,
        ai_score=p.ai_score,
        ai_health_score=p.ai_health_score,
        delay_probability_pct=p.delay_probability_pct,
        predicted_delay_days=p.predicted_delay_days,
        financial_progress_pct=p.financial_progress_pct,
        physical_progress_pct=p.physical_progress_pct,
        sanctioned_amount_cr=p.sanctioned_amount_cr,
        released_amount_cr=p.released_amount_cr,
        expenditure_cr=p.expenditure_cr,
        timeline_adherence_pct=p.timeline_adherence_pct,
        pending_approvals=p.pending_approvals,
        update_consistency_pct=p.update_consistency_pct,
        start_date=p.start_date,
        expected_end_date=p.expected_end_date,
        image_url=p.image_url,
    )


@router.get("", response_model=PaginatedResponse[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    constituency: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    risk_level: Optional[str] = Query(default=None),
    sector: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort_by: str = Query(default="ai_score"),
    order: str = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    """List projects with filtering, sorting, search, and pagination."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712

    # Filters
    if constituency:
        query = query.filter(Project.constituency.ilike(f"%{constituency}%"))
    if status:
        query = query.filter(Project.status == status)
    if risk_level:
        query = query.filter(Project.risk_level == risk_level)
    if sector:
        query = query.filter(Project.sector == sector)
    if search:
        query = query.filter(
            Project.name.ilike(f"%{search}%")
            | Project.code.ilike(f"%{search}%")
            | Project.agency.ilike(f"%{search}%")
        )

    # Sorting
    sort_column = getattr(Project, sort_by, Project.ai_score)
    if order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Count total before pagination
    total = query.count()
    pages = math.ceil(total / per_page) if total > 0 else 1

    # Paginate
    projects = query.offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedResponse(
        items=[_project_to_out(p) for p in projects],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/priority-queue", response_model=list[ProjectOut])
def get_priority_queue(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, le=100),
):
    """AI-ranked priority queue — projects ordered by AI risk score descending."""
    projects = (
        db.query(Project)
        .filter(Project.is_deleted == False)  # noqa: E712
        .order_by(desc(Project.ai_score))
        .limit(limit)
        .all()
    )
    return [_project_to_out(p) for p in projects]


@router.get("/all", response_model=list[ProjectOut])
def list_all_projects(db: Session = Depends(get_db)):
    """Return all projects without pagination (for map view, charts, etc.)."""
    projects = (
        db.query(Project)
        .filter(Project.is_deleted == False)  # noqa: E712
        .order_by(desc(Project.ai_score))
        .all()
    )
    return [_project_to_out(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_out(project)


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    project = Project(
        code=payload.code,
        name=payload.name,
        sector=payload.sector,
        constituency=payload.constituency,
        constituency_id=payload.constituency_id,
        state=payload.state,
        district=payload.district,
        lat=payload.location.lat,
        lng=payload.location.lng,
        agency=payload.agency,
        agency_id=payload.agency_id,
        status=payload.status.value,
        sanctioned_amount_cr=payload.sanctioned_amount_cr,
        released_amount_cr=payload.released_amount_cr,
        expenditure_cr=payload.expenditure_cr,
        physical_progress_pct=payload.physical_progress_pct,
        financial_progress_pct=payload.financial_progress_pct,
        start_date=payload.start_date,
        expected_end_date=payload.expected_end_date,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _project_to_out(project)


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)
):
    """Update project fields (partial update)."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return _project_to_out(project)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Soft-delete a project."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    project.is_deleted = True
    db.commit()


@router.get("/{project_id}/ai-analysis", response_model=ProjectAiAnalysis)
def get_project_ai_analysis(project_id: str, db: Session = Depends(get_db)):
    """AI health score, delay prediction and anomaly explanations for a single project."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return analyze_project_from_model(project)


@router.get("/{project_id}/timeline", response_model=list[ProjectMilestoneOut])
def get_project_timeline(project_id: str, db: Session = Depends(get_db)):
    """Return the milestone timeline for a project."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")

    milestones = (
        db.query(ProjectMilestone)
        .filter(ProjectMilestone.project_id == int(project_id))
        .order_by(ProjectMilestone.date)
        .all()
    )
    return [
        ProjectMilestoneOut(
            label=m.label,
            date=m.date.strftime("%d %b %Y"),
            status=m.status.value,
        )
        for m in milestones
    ]


@router.get("/{project_id}/photos", response_model=list[ProjectPhotoOut])
def get_project_photos(project_id: str, db: Session = Depends(get_db)):
    """Return uploaded photos for a project."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")

    photos = (
        db.query(ProjectPhoto)
        .filter(ProjectPhoto.project_id == int(project_id))
        .order_by(ProjectPhoto.upload_date)
        .all()
    )
    return [
        ProjectPhotoOut(
            date=ph.upload_date.strftime("%d %b %Y"),
            url=ph.file_url,
            ai_verified=ph.ai_verified,
        )
        for ph in photos
    ]


@router.get("/{project_id}/financial-trend", response_model=list[FinancialTrendPointOut])
def get_project_financial_trend(project_id: str, db: Session = Depends(get_db)):
    """Quarterly financial data for a project."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")

    trend = (
        db.query(ProjectFinancialTrend)
        .filter(ProjectFinancialTrend.project_id == int(project_id))
        .order_by(ProjectFinancialTrend.quarter)
        .all()
    )
    return [
        FinancialTrendPointOut(quarter=t.quarter, cumulative=t.cumulative, expected=t.expected)
        for t in trend
    ]


@router.get("/{project_id}/radar", response_model=list[ProjectRadarPoint])
def get_project_radar(project_id: str, db: Session = Depends(get_db)):
    """Radar chart data for the project detail page."""
    project = db.query(Project).filter(Project.id == int(project_id)).first()
    if project is None or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")

    return [
        ProjectRadarPoint(metric="Financial Progress", value=project.financial_progress_pct),
        ProjectRadarPoint(metric="Physical Progress", value=project.physical_progress_pct),
        ProjectRadarPoint(metric="Timeline Adherence", value=project.timeline_adherence_pct),
        ProjectRadarPoint(metric="Update Consistency", value=project.update_consistency_pct),
        ProjectRadarPoint(metric="Pending Approvals", value=max(0, 100 - project.pending_approvals * 20)),
        ProjectRadarPoint(metric="Expenditure Pattern", value=min(100, max(0, 100 - abs(project.financial_progress_pct - project.physical_progress_pct) * 2))),
    ]
