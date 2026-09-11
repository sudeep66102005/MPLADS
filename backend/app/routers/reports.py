"""
Report generation endpoints.

Provides fund utilization summaries, project status reports, and CSV export
of project data for offline analysis.
"""

from __future__ import annotations

import csv
import io
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project
from app.schemas import CamelModel

router = APIRouter()


class FundUtilizationReport(CamelModel):
    total_sanctioned_cr: float
    total_released_cr: float
    total_expenditure_cr: float
    utilization_pct: float
    by_sector: list[dict]


class ProjectStatusReport(CamelModel):
    total: int
    completed: int
    in_progress: int
    delayed: int
    not_started: int
    high_risk: int
    completion_rate_pct: float


@router.get("/fund-utilization", response_model=FundUtilizationReport)
def fund_utilization_report(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """Fund utilization report with sector-wise breakdown."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.all()
    total_sanctioned = sum(p.sanctioned_amount_cr for p in projects)
    total_released = sum(p.released_amount_cr for p in projects)
    total_expenditure = sum(p.expenditure_cr for p in projects)

    # By sector
    sector_data: dict[str, dict] = {}
    for p in projects:
        if p.sector not in sector_data:
            sector_data[p.sector] = {"sanctioned": 0, "released": 0, "expenditure": 0}
        sector_data[p.sector]["sanctioned"] += p.sanctioned_amount_cr
        sector_data[p.sector]["released"] += p.released_amount_cr
        sector_data[p.sector]["expenditure"] += p.expenditure_cr

    by_sector = [
        {
            "sector": sector,
            "sanctioned_cr": round(d["sanctioned"], 2),
            "released_cr": round(d["released"], 2),
            "expenditure_cr": round(d["expenditure"], 2),
            "utilization_pct": round((d["expenditure"] / d["sanctioned"] * 100) if d["sanctioned"] > 0 else 0, 1),
        }
        for sector, d in sorted(sector_data.items())
    ]

    return FundUtilizationReport(
        total_sanctioned_cr=round(total_sanctioned, 2),
        total_released_cr=round(total_released, 2),
        total_expenditure_cr=round(total_expenditure, 2),
        utilization_pct=round((total_expenditure / total_sanctioned * 100) if total_sanctioned > 0 else 0, 1),
        by_sector=by_sector,
    )


@router.get("/project-status", response_model=ProjectStatusReport)
def project_status_report(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """Project status summary report."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.all()
    total = len(projects)
    completed = sum(1 for p in projects if p.status.value == "Completed")
    in_progress = sum(1 for p in projects if p.status.value == "In Progress")
    delayed = sum(1 for p in projects if p.status.value == "Delayed")
    not_started = sum(1 for p in projects if p.status.value == "Not Started")
    high_risk = sum(1 for p in projects if p.risk_level.value in ("High", "Critical"))

    return ProjectStatusReport(
        total=total,
        completed=completed,
        in_progress=in_progress,
        delayed=delayed,
        not_started=not_started,
        high_risk=high_risk,
        completion_rate_pct=round((completed / total * 100) if total > 0 else 0, 1),
    )


@router.get("/export")
def export_projects_csv(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """Export project data as a CSV file."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.order_by(Project.code).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "Code", "Name", "Sector", "Constituency", "State", "District",
        "Agency", "Status", "Risk Level", "AI Score", "AI Health Score",
        "Delay Probability %", "Predicted Delay Days",
        "Physical Progress %", "Financial Progress %",
        "Sanctioned (Cr)", "Released (Cr)", "Expenditure (Cr)",
        "Timeline Adherence %", "Pending Approvals", "Update Consistency %",
        "Start Date", "Expected End Date",
    ])

    for p in projects:
        writer.writerow([
            p.code, p.name, p.sector, p.constituency, p.state, p.district,
            p.agency, p.status.value, p.risk_level.value, p.ai_score, p.ai_health_score,
            p.delay_probability_pct, p.predicted_delay_days,
            p.physical_progress_pct, p.financial_progress_pct,
            p.sanctioned_amount_cr, p.released_amount_cr, p.expenditure_cr,
            p.timeline_adherence_pct, p.pending_approvals, p.update_consistency_pct,
            p.start_date.isoformat(), p.expected_end_date.isoformat(),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mplads_projects.csv"},
    )
