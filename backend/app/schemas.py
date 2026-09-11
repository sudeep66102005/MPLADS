"""
Pydantic models shared across the API layer.

These map 1:1 to the TypeScript types in
`frontend/src/lib/types.ts` so the dashboard and backend agree on shape.
Field names here use snake_case internally, but are serialized to camelCase
via ``alias_generator`` so the JSON wire format matches the frontend exactly.
"""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


# ── Base config with camelCase aliases ────────────────────────────────────

class CamelModel(BaseModel):
    """Base model that converts snake_case fields to camelCase in JSON output."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# ── Enums ─────────────────────────────────────────────────────────────────

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


class UserRole(str, Enum):
    mp = "MP"
    district_nodal_authority = "District Nodal Authority"
    state_nodal_authority = "State Nodal Authority"
    mospi = "MoSPI / Central Nodal Agency"
    implementing_agency = "Implementing Agency"
    inspecting_officer = "Inspecting / Field Officer"
    admin = "Admin"


# ── Pagination ────────────────────────────────────────────────────────────

T = TypeVar("T")


class PaginatedResponse(CamelModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int


# ── Geo ───────────────────────────────────────────────────────────────────

class GeoPoint(CamelModel):
    lat: float
    lng: float


# ── Auth ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    display_name: str


class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole
    display_name: str
    constituency_id: Optional[int] = None


class UserOut(CamelModel):
    id: int
    username: str
    role: UserRole
    display_name: str
    constituency_id: Optional[int] = None
    is_active: bool


class TokenRefreshRequest(BaseModel):
    token: str


# ── Projects ─────────────────────────────────────────────────────────────

class ProjectBase(CamelModel):
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
    agency_id: int
    constituency_id: int


class ProjectUpdate(CamelModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[ProjectStatus] = None
    physical_progress_pct: Optional[float] = None
    financial_progress_pct: Optional[float] = None
    expenditure_cr: Optional[float] = None
    released_amount_cr: Optional[float] = None
    timeline_adherence_pct: Optional[float] = None
    pending_approvals: Optional[int] = None
    update_consistency_pct: Optional[float] = None
    expected_end_date: Optional[date] = None


class ProjectOut(CamelModel):
    id: str
    code: str
    name: str
    sector: str
    constituency: str
    state: str
    district: str
    location: GeoPoint
    agency: str
    status: ProjectStatus
    risk_level: RiskLevel
    ai_score: float = Field(ge=0, le=100, description="0-100, higher = higher priority for review")
    ai_health_score: float = Field(ge=0, le=100)
    delay_probability_pct: float = Field(ge=0, le=100)
    predicted_delay_days: int
    financial_progress_pct: float
    physical_progress_pct: float
    sanctioned_amount_cr: float
    released_amount_cr: float
    expenditure_cr: float
    timeline_adherence_pct: float
    pending_approvals: int
    update_consistency_pct: float
    start_date: date
    expected_end_date: date
    image_url: Optional[str] = None


# ── Project sub-resources ─────────────────────────────────────────────────

class ProjectMilestoneOut(CamelModel):
    label: str
    date: str
    status: str


class ProjectPhotoOut(CamelModel):
    date: str
    url: str
    ai_verified: Optional[bool] = None


class FinancialTrendPointOut(CamelModel):
    quarter: str
    cumulative: float
    expected: float


class ProjectRadarPoint(CamelModel):
    metric: str
    value: float


class RiskIndicatorOut(CamelModel):
    id: str
    title: str
    detail: str
    severity: str


# ── AI Analysis ───────────────────────────────────────────────────────────

class AiExplanation(CamelModel):
    """One line, human-readable reason behind an AI score — the core
    'explainable' requirement from the SIH26102 problem statement."""
    factor: str
    detail: str
    severity: RiskLevel


class ProjectAiAnalysis(CamelModel):
    project_id: str
    ai_health_score: float
    delay_probability_pct: float
    predicted_delay_days: int
    verified_progress_pct: Optional[float] = Field(
        default=None, description="AI-verified progress from photo/evidence analysis"
    )
    explanations: list[AiExplanation]


# ── Agencies ──────────────────────────────────────────────────────────────

class AgencyOut(CamelModel):
    id: str
    name: str
    projects_count: int
    completion_rate_pct: float
    avg_delay_days: float
    cost_variation_pct: float
    stalled_projects: int
    update_consistency_pct: float
    ai_score: float


# ── Constituencies ────────────────────────────────────────────────────────

class ConstituencyOut(CamelModel):
    id: int
    name: str
    state: str
    district: str


class SectorGapOut(CamelModel):
    sector: str
    need: float
    need_score: float
    covered: float
    covered_score: float
    gap_pct: float
    gap_level: str


class WardGapOut(CamelModel):
    rank: int
    area: str
    block: str
    gap_sector: str
    need_level: str


class ConstituencyTrendOut(CamelModel):
    year: str
    funds_released_cr: float
    expenditure_cr: float
    avg_physical_progress_pct: float
    projects: Optional[int] = None
    cumulative_allocation_cr: Optional[float] = None


class RecommendationOut(CamelModel):
    id: str
    priority: int
    title: str
    description: str
    type: str


class ConstituencyKpiOut(CamelModel):
    total_projects: int
    total_projects_yoy: int
    total_allocation_cr: float
    fund_utilization_pct: float
    fund_utilized_cr: float
    avg_ai_health_score: float
    development_gaps: int
    high_risk_projects: int


# ── Dashboard ─────────────────────────────────────────────────────────────

class DashboardKpiOut(CamelModel):
    total_projects: int
    total_projects_yoy: int
    high_risk: int
    high_risk_pct: float
    delayed: int
    delayed_pct: float
    total_allocation_cr: float
    fund_utilization_pct: float
    development_gaps: int


class SectorDistributionOut(CamelModel):
    sector: str
    value: int
    pct: float
    color: str


class TopIssueOut(CamelModel):
    id: str
    title: str
    meta: str
    severity: str


class AiInsightOut(CamelModel):
    id: str
    tone: str  # "positive", "warning", "info"
    text: str


# ── Inspections ───────────────────────────────────────────────────────────

class InspectionCreate(BaseModel):
    project_id: int
    inspection_date: date
    findings: Optional[str] = None


class InspectionOut(CamelModel):
    id: int
    project_id: int
    inspector_id: int
    inspection_date: date
    status: str
    findings: Optional[str] = None
    physical_progress_observed_pct: Optional[float] = None
    created_at: datetime


class InspectionUpdate(BaseModel):
    status: Optional[str] = None
    findings: Optional[str] = None
    physical_progress_observed_pct: Optional[float] = None
