"""
Agency performance endpoints — backs the Agency Performance page and
the "Implementing Agency Performance Score" AI feature.

Wired to SQLAlchemy queries against the agencies table.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Agency, Project
from app.schemas import AgencyOut, ProjectOut, GeoPoint

router = APIRouter()


def _agency_to_out(a: Agency) -> AgencyOut:
    return AgencyOut(
        id=str(a.id),
        name=a.name,
        projects_count=a.projects_count,
        completion_rate_pct=a.completion_rate_pct,
        avg_delay_days=a.avg_delay_days,
        cost_variation_pct=a.cost_variation_pct,
        stalled_projects=a.stalled_projects,
        update_consistency_pct=a.update_consistency_pct,
        ai_score=a.ai_score,
    )


@router.get("", response_model=list[AgencyOut])
def list_agencies(db: Session = Depends(get_db)) -> list[AgencyOut]:
    agencies = db.query(Agency).order_by(Agency.ai_score.desc()).all()
    return [_agency_to_out(a) for a in agencies]


@router.get("/{agency_id}", response_model=AgencyOut)
def get_agency(agency_id: str, db: Session = Depends(get_db)) -> AgencyOut:
    agency = db.query(Agency).filter(Agency.id == int(agency_id)).first()
    if agency is None:
        raise HTTPException(status_code=404, detail="Agency not found")
    return _agency_to_out(agency)


@router.get("/{agency_id}/projects", response_model=list[ProjectOut])
def get_agency_projects(agency_id: str, db: Session = Depends(get_db)):
    """List all projects belonging to this agency."""
    agency = db.query(Agency).filter(Agency.id == int(agency_id)).first()
    if agency is None:
        raise HTTPException(status_code=404, detail="Agency not found")

    projects = (
        db.query(Project)
        .filter(Project.agency_id == int(agency_id), Project.is_deleted == False)  # noqa: E712
        .order_by(Project.ai_score.desc())
        .all()
    )
    return [
        ProjectOut(
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
        for p in projects
    ]
