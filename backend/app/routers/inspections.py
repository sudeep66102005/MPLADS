"""
Inspection dossier endpoints — CRUD for field inspections.

Backs the Inspection Dossiers page and the inspection workflow
described in the system architecture (Field Officer → Inspection →
Findings → Action).
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InspectionReport, InspectionStatusEnum
from app.schemas import InspectionCreate, InspectionOut, InspectionUpdate

router = APIRouter()


@router.get("", response_model=list[InspectionOut])
def list_inspections(
    db: Session = Depends(get_db),
    project_id: Optional[int] = Query(default=None),
    status: Optional[str] = Query(default=None),
):
    """List inspection reports, optionally filtered by project or status."""
    query = db.query(InspectionReport)
    if project_id:
        query = query.filter(InspectionReport.project_id == project_id)
    if status:
        query = query.filter(InspectionReport.status == status)

    inspections = query.order_by(InspectionReport.inspection_date.desc()).all()
    return [
        InspectionOut(
            id=i.id,
            project_id=i.project_id,
            inspector_id=i.inspector_id,
            inspection_date=i.inspection_date,
            status=i.status.value,
            findings=i.findings,
            physical_progress_observed_pct=i.physical_progress_observed_pct,
            created_at=i.created_at,
        )
        for i in inspections
    ]


@router.post("", response_model=InspectionOut, status_code=201)
def create_inspection(
    payload: InspectionCreate,
    db: Session = Depends(get_db),
):
    """Create a new inspection report."""
    inspection = InspectionReport(
        project_id=payload.project_id,
        inspector_id=1,  # TODO: use get_current_user once auth is wired
        inspection_date=payload.inspection_date,
        findings=payload.findings,
        status=InspectionStatusEnum.scheduled,
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    return InspectionOut(
        id=inspection.id,
        project_id=inspection.project_id,
        inspector_id=inspection.inspector_id,
        inspection_date=inspection.inspection_date,
        status=inspection.status.value,
        findings=inspection.findings,
        physical_progress_observed_pct=inspection.physical_progress_observed_pct,
        created_at=inspection.created_at,
    )


@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(InspectionReport).filter(InspectionReport.id == inspection_id).first()
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return InspectionOut(
        id=inspection.id,
        project_id=inspection.project_id,
        inspector_id=inspection.inspector_id,
        inspection_date=inspection.inspection_date,
        status=inspection.status.value,
        findings=inspection.findings,
        physical_progress_observed_pct=inspection.physical_progress_observed_pct,
        created_at=inspection.created_at,
    )


@router.patch("/{inspection_id}", response_model=InspectionOut)
def update_inspection(
    inspection_id: int,
    payload: InspectionUpdate,
    db: Session = Depends(get_db),
):
    """Update inspection findings, status, or observed progress."""
    inspection = db.query(InspectionReport).filter(InspectionReport.id == inspection_id).first()
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inspection, field, value)

    db.commit()
    db.refresh(inspection)

    return InspectionOut(
        id=inspection.id,
        project_id=inspection.project_id,
        inspector_id=inspection.inspector_id,
        inspection_date=inspection.inspection_date,
        status=inspection.status.value,
        findings=inspection.findings,
        physical_progress_observed_pct=inspection.physical_progress_observed_pct,
        created_at=inspection.created_at,
    )
