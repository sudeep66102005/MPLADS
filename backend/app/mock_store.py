"""
In-memory mock data store.

Stands in for the real Database layer (PostgreSQL + PostGIS, per the system
architecture) so the API is runnable and testable without a live database.
Swap this module for real SQLAlchemy models/queries once the DB is
provisioned — the router layer is written against this module's function
signatures so that swap should not require touching the routers much.
"""

from __future__ import annotations

from datetime import date

_PROJECTS: list[dict] = [
    {
        "id": "1",
        "code": "MPLADS/2023/001",
        "name": "Construction of Community Hall",
        "sector": "Community Infrastructure",
        "constituency": "Berasia, Bhopal MP",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "location": {"lat": 23.40, "lng": 77.42},
        "agency": "Rural Development Dept.",
        "status": "In Progress",
        "risk_level": "High",
        "ai_score": 32,
        "ai_health_score": 32,
        "delay_probability_pct": 78,
        "predicted_delay_days": 45,
        "financial_progress_pct": 82,
        "physical_progress_pct": 48,
        "sanctioned_amount_cr": 50,
        "released_amount_cr": 42.5,
        "expenditure_cr": 41,
        "timeline_adherence_pct": 40,
        "pending_approvals": 3,
        "update_consistency_pct": 50,
        "start_date": date(2023, 1, 12),
        "expected_end_date": date(2024, 12, 31),
    },
    {
        "id": "2",
        "code": "MPLADS/2023/014",
        "name": "Rural Road Development",
        "sector": "Roads & Transport",
        "constituency": "Huzur, Bhopal MP",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "location": {"lat": 23.32, "lng": 77.50},
        "agency": "Public Works Dept.",
        "status": "Delayed",
        "risk_level": "High",
        "ai_score": 45,
        "ai_health_score": 55,
        "delay_probability_pct": 82,
        "predicted_delay_days": 78,
        "financial_progress_pct": 91,
        "physical_progress_pct": 40,
        "sanctioned_amount_cr": 30,
        "released_amount_cr": 27.3,
        "expenditure_cr": 27.3,
        "timeline_adherence_pct": 35,
        "pending_approvals": 2,
        "update_consistency_pct": 45,
        "start_date": date(2022, 11, 1),
        "expected_end_date": date(2024, 6, 30),
    },
]

_AGENCIES: list[dict] = [
    {
        "id": "1",
        "name": "Rural Development Dept.",
        "projects_count": 48,
        "completion_rate_pct": 72,
        "avg_delay_days": 42,
        "cost_variation_pct": 12,
        "stalled_projects": 7,
        "update_consistency_pct": 68,
        "ai_score": 68,
    },
    {
        "id": "2",
        "name": "Public Works Dept.",
        "projects_count": 36,
        "completion_rate_pct": 78,
        "avg_delay_days": 36,
        "cost_variation_pct": 8,
        "stalled_projects": 5,
        "update_consistency_pct": 71,
        "ai_score": 71,
    },
]

_SECTOR_GAPS: list[dict] = [
    {"sector": "Drinking Water", "need": 48, "covered": 13, "gap_pct": 72, "gap_level": "High"},
    {"sector": "Healthcare", "need": 36, "covered": 15, "gap_pct": 42, "gap_level": "High"},
    {"sector": "Sanitation", "need": 28, "covered": 14, "gap_pct": 51, "gap_level": "Medium"},
]


def list_projects() -> list[dict]:
    return _PROJECTS


def get_project(project_id: str) -> dict | None:
    return next((p for p in _PROJECTS if p["id"] == project_id), None)


def list_agencies() -> list[dict]:
    return _AGENCIES


def get_agency(agency_id: str) -> dict | None:
    return next((a for a in _AGENCIES if a["id"] == agency_id), None)


def list_sector_gaps() -> list[dict]:
    return _SECTOR_GAPS
