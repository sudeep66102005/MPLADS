"""
SQLAlchemy ORM models.

These map to the PostgreSQL + PostGIS database tables defined in the system
architecture. Each model corresponds to a Pydantic schema in ``schemas.py``
and, transitively, to a TypeScript type in the frontend's ``types.ts``.

PostGIS geometry columns are used for ``Project.geometry`` and
``Constituency.geometry`` so spatial queries (proximity, bounding-box) can
be run natively in the database.
"""

from __future__ import annotations

import enum
from datetime import date, datetime

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ── Enums ────────────────────────────────────────────────────────────────


class ProjectStatusEnum(str, enum.Enum):
    completed = "Completed"
    in_progress = "In Progress"
    delayed = "Delayed"
    not_started = "Not Started"
    high_risk = "High Risk"


class RiskLevelEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"


class UserRoleEnum(str, enum.Enum):
    mp = "MP"
    district_nodal_authority = "District Nodal Authority"
    state_nodal_authority = "State Nodal Authority"
    mospi = "MoSPI / Central Nodal Agency"
    implementing_agency = "Implementing Agency"
    inspecting_officer = "Inspecting / Field Officer"
    admin = "Admin"


class MilestoneStatusEnum(str, enum.Enum):
    completed = "Completed"
    in_progress = "In Progress"
    delayed = "Delayed"
    pending = "Pending"


class InspectionStatusEnum(str, enum.Enum):
    scheduled = "Scheduled"
    in_progress = "In Progress"
    completed = "Completed"
    cancelled = "Cancelled"


class GapLevelEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class NeedLevelEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


# ── Models ───────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRoleEnum), nullable=False, default=UserRoleEnum.inspecting_officer)
    display_name = Column(String(200), nullable=False)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    constituency = relationship("Constituency", back_populates="users")
    inspections = relationship("InspectionReport", back_populates="inspector")


class Constituency(Base):
    __tablename__ = "constituencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    geometry = Column(Geometry("POLYGON", srid=4326), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    users = relationship("User", back_populates="constituency")
    projects = relationship("Project", back_populates="constituency_rel")
    sector_gaps = relationship("SectorGap", back_populates="constituency", cascade="all, delete-orphan")
    ward_gaps = relationship("WardGap", back_populates="constituency", cascade="all, delete-orphan")
    trend_points = relationship("ConstituencyTrend", back_populates="constituency", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="constituency", cascade="all, delete-orphan")


class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    projects_count = Column(Integer, default=0, nullable=False)
    completion_rate_pct = Column(Float, default=0.0, nullable=False)
    avg_delay_days = Column(Float, default=0.0, nullable=False)
    cost_variation_pct = Column(Float, default=0.0, nullable=False)
    stalled_projects = Column(Integer, default=0, nullable=False)
    update_consistency_pct = Column(Float, default=0.0, nullable=False)
    ai_score = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="agency_rel")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(300), nullable=False)
    sector = Column(String(100), nullable=False, index=True)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=False)
    constituency = Column(String(200), nullable=False)  # denormalized display name
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    geometry = Column(Geometry("POINT", srid=4326), nullable=True)
    agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=False)
    agency = Column(String(200), nullable=False)  # denormalized display name
    status = Column(Enum(ProjectStatusEnum), nullable=False, default=ProjectStatusEnum.not_started)
    risk_level = Column(Enum(RiskLevelEnum), nullable=False, default=RiskLevelEnum.low)
    ai_score = Column(Float, default=0.0, nullable=False)
    ai_health_score = Column(Float, default=0.0, nullable=False)
    delay_probability_pct = Column(Float, default=0.0, nullable=False)
    predicted_delay_days = Column(Integer, default=0, nullable=False)
    financial_progress_pct = Column(Float, default=0.0, nullable=False)
    physical_progress_pct = Column(Float, default=0.0, nullable=False)
    sanctioned_amount_cr = Column(Float, default=0.0, nullable=False)
    released_amount_cr = Column(Float, default=0.0, nullable=False)
    expenditure_cr = Column(Float, default=0.0, nullable=False)
    timeline_adherence_pct = Column(Float, default=0.0, nullable=False)
    pending_approvals = Column(Integer, default=0, nullable=False)
    update_consistency_pct = Column(Float, default=0.0, nullable=False)
    start_date = Column(Date, nullable=False)
    expected_end_date = Column(Date, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    constituency_rel = relationship("Constituency", back_populates="projects")
    agency_rel = relationship("Agency", back_populates="projects")
    photos = relationship("ProjectPhoto", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan", order_by="ProjectMilestone.date")
    ai_score_history = relationship("AiScoreHistory", back_populates="project", cascade="all, delete-orphan")
    financial_trend = relationship("ProjectFinancialTrend", back_populates="project", cascade="all, delete-orphan", order_by="ProjectFinancialTrend.quarter")
    inspections = relationship("InspectionReport", back_populates="project")

    # Indexes
    __table_args__ = (
        Index("ix_projects_status_risk", "status", "risk_level"),
        Index("ix_projects_constituency_sector", "constituency_id", "sector"),
    )


class ProjectPhoto(Base):
    __tablename__ = "project_photos"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    file_url = Column(String(500), nullable=False)
    upload_date = Column(Date, nullable=False)
    ai_verified = Column(Boolean, nullable=True)  # None = not yet verified
    ai_verification_note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="photos")


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    label = Column(String(200), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(MilestoneStatusEnum), nullable=False, default=MilestoneStatusEnum.pending)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="milestones")


class ProjectFinancialTrend(Base):
    __tablename__ = "project_financial_trends"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    quarter = Column(String(20), nullable=False)  # e.g. "Q3 2023"
    cumulative = Column(Float, nullable=False)
    expected = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="financial_trend")


class AiScoreHistory(Base):
    __tablename__ = "ai_score_history"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    ai_health_score = Column(Float, nullable=False)
    delay_probability_pct = Column(Float, nullable=False)
    predicted_delay_days = Column(Integer, nullable=False)
    scored_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="ai_score_history")


class SectorGap(Base):
    __tablename__ = "sector_gaps"

    id = Column(Integer, primary_key=True, index=True)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=False)
    sector = Column(String(100), nullable=False)
    need = Column(Float, nullable=False)
    need_score = Column(Float, nullable=False)
    covered = Column(Float, nullable=False)
    covered_score = Column(Float, nullable=False)
    gap_pct = Column(Float, nullable=False)
    gap_level = Column(Enum(GapLevelEnum), nullable=False)

    # Relationships
    constituency = relationship("Constituency", back_populates="sector_gaps")


class WardGap(Base):
    __tablename__ = "ward_gaps"

    id = Column(Integer, primary_key=True, index=True)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=False)
    rank = Column(Integer, nullable=False)
    area = Column(String(200), nullable=False)
    block = Column(String(200), nullable=False)
    gap_sector = Column(String(100), nullable=False)
    need_level = Column(Enum(NeedLevelEnum), nullable=False)

    # Relationships
    constituency = relationship("Constituency", back_populates="ward_gaps")


class ConstituencyTrend(Base):
    __tablename__ = "constituency_trends"

    id = Column(Integer, primary_key=True, index=True)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=False)
    year = Column(String(10), nullable=False)
    funds_released_cr = Column(Float, nullable=False, default=0.0)
    expenditure_cr = Column(Float, nullable=False, default=0.0)
    avg_physical_progress_pct = Column(Float, nullable=False, default=0.0)
    projects = Column(Integer, nullable=True)
    cumulative_allocation_cr = Column(Float, nullable=True)

    # Relationships
    constituency = relationship("Constituency", back_populates="trend_points")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=False)
    priority = Column(Integer, nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # "High Gap", "Medium Gap", "Monitoring", "Convergence"

    # Relationships
    constituency = relationship("Constituency", back_populates="recommendations")


class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    inspection_date = Column(Date, nullable=False)
    status = Column(Enum(InspectionStatusEnum), nullable=False, default=InspectionStatusEnum.scheduled)
    findings = Column(Text, nullable=True)
    physical_progress_observed_pct = Column(Float, nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="inspections")
    inspector = relationship("User", back_populates="inspections")
