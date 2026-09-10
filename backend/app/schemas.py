"""
Pydantic models shared across the API layer.

These map 1:1 to the TypeScript types in
`frontend/src/lib/types.ts` so the dashboard and backend agree on shape.
Field names here are the wire contract; the frontend mock data layer
(`frontend/src/lib/mockData.ts`) will be swapped for real calls against
these endpoints once the Database + AI Engine are wired up.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    completed = "Completed"
    in_progress = "In Progress"
    delayed = "Delayed"
    not_started = "Not Started"
    high_risk = "High Risk"


class RiskLevel(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"


class GeoPoint(BaseModel):
    lat: float
    lng: float


class ProjectBase(BaseModel):
    code: str = Field(..., examples=["MPLADS/2023/001"])
    name: str
    sector: str
    constituency: str
    state: str
    district: str
    location: GeoPoint
    agency: str
    status: ProjectStatus
    sanctioned_amount_cr: float
    released_amount_cr: float
    expenditure_cr: float
    physical_progress_pct: float = Field(ge=0, le=100)
    financial_progress_pct: float = Field(ge=0, le=100)
    start_date: date
    expected_end_date: date


class ProjectCreate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    id: str
    risk_level: RiskLevel
    ai_score: float = Field(ge=0, le=100, description="0-100, higher = higher priority for review")
    ai_health_score: float = Field(ge=0, le=100)
    delay_probability_pct: float = Field(ge=0, le=100)
    predicted_delay_days: int
    timeline_adherence_pct: float
    pending_approvals: int
    update_consistency_pct: float

    class Config:
        from_attributes = True


class AgencyOut(BaseModel):
    id: str
    name: str
    projects_count: int
    completion_rate_pct: float
    avg_delay_days: float
    cost_variation_pct: float
    stalled_projects: int
    update_consistency_pct: float
    ai_score: float


class SectorGapOut(BaseModel):
    sector: str
    need: float
    covered: float
    gap_pct: float
    gap_level: str


class AiExplanation(BaseModel):
    """One line, human-readable reason behind an AI score — the core
    'explainable' requirement from the SIH26102 problem statement."""

    factor: str
    detail: str
    severity: RiskLevel


class ProjectAiAnalysis(BaseModel):
    project_id: str
    ai_health_score: float
    delay_probability_pct: float
    predicted_delay_days: int
    verified_progress_pct: Optional[float] = Field(
        default=None, description="AI-verified progress from photo/evidence analysis"
    )
    explanations: list[AiExplanation]
