"""Validated write contracts. Money fields retain the existing API's crore units."""
from datetime import date
from typing import Literal
from pydantic import Field, model_validator
from app.schemas import CamelModel, ProjectCreate, ProjectUpdate, UserRole

class ProjectInput(ProjectCreate):
    code: str = Field(min_length=1, max_length=50, pattern=r"^[A-Za-z0-9/_-]+$")
    name: str = Field(min_length=1, max_length=300)
    sanctioned_amount_cr: float = Field(gt=0, allow_inf_nan=False)
    released_amount_cr: float = Field(ge=0, allow_inf_nan=False)
    expenditure_cr: float = Field(ge=0, allow_inf_nan=False)
    @model_validator(mode="after")
    def valid_project(self):
        if self.expected_end_date <= self.start_date:
            raise ValueError("End date must be after start date")
        if not -90 <= self.location.lat <= 90 or not -180 <= self.location.lng <= 180:
            raise ValueError("Invalid coordinates")
        if self.expenditure_cr > self.released_amount_cr or self.released_amount_cr > self.sanctioned_amount_cr:
            raise ValueError("Require expenditure <= released <= sanctioned")
        return self

class ProjectPatch(ProjectUpdate):
    name: str | None = Field(default=None, min_length=1, max_length=300)
    physical_progress_pct: float | None = Field(default=None, ge=0, le=100)
    financial_progress_pct: float | None = Field(default=None, ge=0, le=100)
    timeline_adherence_pct: float | None = Field(default=None, ge=0, le=100)
    update_consistency_pct: float | None = Field(default=None, ge=0, le=100)
    expenditure_cr: float | None = Field(default=None, ge=0)
    released_amount_cr: float | None = Field(default=None, ge=0)
    pending_approvals: int | None = Field(default=None, ge=0, le=1000)
    @model_validator(mode="after")
    def no_null(self):
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError("Explicit null values are not allowed")
        return self

class AssignInspection(CamelModel):
    project_id: int
    inspector_id: int
    inspection_date: date
    request_key: str = Field(min_length=8, max_length=80)

class InspectionPatch(CamelModel):
    version: int = Field(ge=1)
    findings: str = Field(default="", max_length=10000)
    physical_progress_observed_pct: float | None = Field(default=None, ge=0, le=100)
    checklist: dict[str, bool] = Field(default_factory=dict, max_length=30)
    evidence_ids: list[int] = Field(default_factory=list, max_length=30)

class ReviewInput(CamelModel):
    version: int = Field(ge=1)
    decision: Literal["Closed", "Needs clarification", "Reopened"]
    outcome: Literal["Issue confirmed", "False positive", "Needs evidence", "Resolved"]
    note: str = Field(min_length=5, max_length=5000)

class UserInput(CamelModel):
    username: str = Field(min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9._-]+$")
    password: str = Field(min_length=10, max_length=64)
    display_name: str = Field(min_length=1, max_length=200)
    role: UserRole
    constituency_id: int | None = None

class GrantInput(CamelModel):
    constituency_id: int
    agency_id: int | None = None

class UserStatusInput(CamelModel):
    is_active: bool

class ConstituencyInput(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    state: str = Field(min_length=1, max_length=100)
    district: str = Field(min_length=1, max_length=100)

class AgencyInput(CamelModel):
    name: str = Field(min_length=1, max_length=200)

class MilestoneInput(CamelModel):
    label: str = Field(min_length=1, max_length=200)
    date: date
    status: Literal["Completed", "In Progress", "Delayed", "Pending"]

class GapInput(CamelModel):
    sector: str = Field(min_length=1, max_length=100)
    need: float = Field(gt=0)
    covered: float = Field(ge=0)
    source: str = Field(min_length=5, max_length=1000)
    as_of: date
    @model_validator(mode="after")
    def coverage(self):
        if self.covered > self.need:
            raise ValueError("Covered must not exceed need; use consistent service units")
        return self
