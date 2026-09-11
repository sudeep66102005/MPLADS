"""
Dashboard aggregate endpoints.

Computes top-level KPIs, sector distributions, project trends, top issues,
and AI insights from the database — powering the dashboard home page.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, SectorGap
from app.schemas import (
    AiInsightOut,
    DashboardKpiOut,
    SectorDistributionOut,
    TopIssueOut,
    ConstituencyTrendOut,
)

router = APIRouter()

# Sector colors for the pie chart
SECTOR_COLORS = {
    "Roads & Transport": "#1e4fd6",
    "Drinking Water": "#22b8b0",
    "Sanitation": "#f2b705",
    "Healthcare": "#e05353",
    "Education": "#7c5cd6",
    "Community Infrastructure": "#5db35c",
    "Others": "#9aa4b8",
}


@router.get("/kpis", response_model=DashboardKpiOut)
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """Aggregate KPIs for the dashboard home page."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.all()
    total = len(projects)

    if total == 0:
        return DashboardKpiOut(
            total_projects=0, total_projects_yoy=0, high_risk=0,
            high_risk_pct=0, delayed=0, delayed_pct=0,
            total_allocation_cr=0, fund_utilization_pct=0, development_gaps=0,
        )

    high_risk = sum(1 for p in projects if p.risk_level.value in ("High", "Critical"))
    delayed = sum(1 for p in projects if p.status.value == "Delayed")
    total_allocation = sum(p.sanctioned_amount_cr for p in projects)
    total_expenditure = sum(p.expenditure_cr for p in projects)
    utilization = round((total_expenditure / total_allocation * 100) if total_allocation > 0 else 0, 1)

    # Count development gaps
    gap_query = db.query(SectorGap).filter(SectorGap.gap_level.in_(["High", "Medium"]))
    if constituency_id:
        gap_query = gap_query.filter(SectorGap.constituency_id == constituency_id)
    dev_gaps = gap_query.count()

    return DashboardKpiOut(
        total_projects=total,
        total_projects_yoy=12,
        high_risk=high_risk,
        high_risk_pct=round(high_risk / total * 100, 1) if total > 0 else 0,
        delayed=delayed,
        delayed_pct=round(delayed / total * 100, 1) if total > 0 else 0,
        total_allocation_cr=round(total_allocation, 1),
        fund_utilization_pct=utilization,
        development_gaps=dev_gaps,
    )


@router.get("/sector-distribution", response_model=list[SectorDistributionOut])
def get_sector_distribution(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """Sector-wise project distribution for the pie chart."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.all()
    total = len(projects)

    # Count by sector
    sector_counts: dict[str, int] = {}
    for p in projects:
        sector_counts[p.sector] = sector_counts.get(p.sector, 0) + 1

    result = []
    for sector, count in sorted(sector_counts.items(), key=lambda x: -x[1]):
        result.append(SectorDistributionOut(
            sector=sector,
            value=count,
            pct=round(count / total * 100, 1) if total > 0 else 0,
            color=SECTOR_COLORS.get(sector, "#9aa4b8"),
        ))

    return result


@router.get("/top-issues", response_model=list[TopIssueOut])
def get_top_issues(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """AI-identified top issues across projects."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.all()

    # Compute issues by sector
    sector_stats: dict[str, dict] = {}
    for p in projects:
        if p.sector not in sector_stats:
            sector_stats[p.sector] = {"count": 0, "delayed": 0, "high_risk": 0}
        sector_stats[p.sector]["count"] += 1
        if p.status.value == "Delayed":
            sector_stats[p.sector]["delayed"] += 1
        if p.risk_level.value in ("High", "Critical"):
            sector_stats[p.sector]["high_risk"] += 1

    issues = []
    for i, (sector, stats) in enumerate(
        sorted(sector_stats.items(), key=lambda x: -(x[1]["delayed"] + x[1]["high_risk"])),
        start=1,
    ):
        delay_risk = round(stats["delayed"] / stats["count"] * 100) if stats["count"] > 0 else 0
        severity = "High" if delay_risk > 30 else "Medium" if delay_risk > 15 else "Low"
        issues.append(TopIssueOut(
            id=str(i),
            title=sector,
            meta=f"{stats['count']} projects | {delay_risk}% delay risk",
            severity=severity,
        ))

    return issues[:6]


@router.get("/ai-insights", response_model=list[AiInsightOut])
def get_ai_insights(
    db: Session = Depends(get_db),
    constituency_id: Optional[int] = Query(default=None),
):
    """Natural-language AI insights for the dashboard."""
    query = db.query(Project).filter(Project.is_deleted == False)  # noqa: E712
    if constituency_id:
        query = query.filter(Project.constituency_id == constituency_id)

    projects = query.all()
    total = len(projects)

    if total == 0:
        return [AiInsightOut(id="1", tone="info", text="No project data available yet.")]

    high_risk = sum(1 for p in projects if p.risk_level.value in ("High", "Critical"))
    delayed = sum(1 for p in projects if p.status.value == "Delayed")
    total_alloc = sum(p.sanctioned_amount_cr for p in projects)
    total_exp = sum(p.expenditure_cr for p in projects)
    utilization = round((total_exp / total_alloc * 100) if total_alloc > 0 else 0)

    insights = []
    insights.append(AiInsightOut(
        id="1",
        tone="positive" if utilization > 70 else "warning",
        text=f"Fund utilization is at {utilization}% with {delayed} projects currently delayed.",
    ))

    if high_risk > 0:
        insights.append(AiInsightOut(
            id="2",
            tone="warning",
            text=f"{high_risk} projects are flagged as high risk and need immediate attention.",
        ))

    # Find the worst sector
    sector_delay_rates: dict[str, tuple[int, int]] = {}
    for p in projects:
        d, t = sector_delay_rates.get(p.sector, (0, 0))
        sector_delay_rates[p.sector] = (d + (1 if p.status.value == "Delayed" else 0), t + 1)

    worst_sector = max(sector_delay_rates.items(), key=lambda x: x[1][0] / max(x[1][1], 1))
    if worst_sector[1][0] > 0:
        insights.append(AiInsightOut(
            id="3",
            tone="warning",
            text=f"{worst_sector[0]} projects have the highest delay rate ({worst_sector[1][0]}/{worst_sector[1][1]}).",
        ))

    insights.append(AiInsightOut(
        id="4",
        tone="info",
        text=f"Consider prioritizing monitoring for the {high_risk} high-risk projects to prevent further delays.",
    ))

    return insights
