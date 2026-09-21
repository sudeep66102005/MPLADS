"""Additive tables for access, evidence, workflow and reproducible analysis."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, UniqueConstraint, func
from app.database import Base

class AccessGrant(Base):
    __tablename__ = "access_grants"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=False)
    agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=True)

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    detail = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    rule_version = Column(String(50), nullable=False)
    inputs = Column(JSON, nullable=False)
    result = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_key = Column(String(100), nullable=False)
    filename = Column(String(80), nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    perceptual_hash = Column(String(16), nullable=False)
    mime_type = Column(String(40), nullable=False)
    size = Column(Integer, nullable=False)
    caption = Column(Text, nullable=False, default="")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    distance_km = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    __table_args__ = (UniqueConstraint("uploaded_by", "request_key"),)

class InspectionWorkflow(Base):
    __tablename__ = "inspection_workflows"
    inspection_id = Column(Integer, ForeignKey("inspection_reports.id"), primary_key=True)
    request_key = Column(String(100), nullable=False, unique=True)
    state = Column(String(30), nullable=False, default="Assigned")
    version = Column(Integer, nullable=False, default=1)
    checklist = Column(JSON, nullable=False, default=dict)
    evidence_ids = Column(JSON, nullable=False, default=list)
    outcome = Column(String(40), nullable=True)
    review_note = Column(Text, nullable=True)

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    jti = Column(String(64), primary_key=True)
    expires_at = Column(DateTime, nullable=False)

class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

class ProjectRevision(Base):
    __tablename__ = "project_revisions"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String(50), nullable=False)
    values = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
