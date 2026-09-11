"""
Test fixtures — provides a test database and FastAPI test client.

Uses SQLite in-memory for fast, isolated tests (no PostgreSQL needed).
PostGIS-specific features (geometry columns) are excluded in test mode.
"""

import os

# Force SQLite for tests BEFORE any app imports
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

import pytest
from fastapi.testclient import TestClient
from geoalchemy2 import Geometry
import geoalchemy2.admin.dialects.sqlite as sqlite_admin
from sqlalchemy import create_engine, event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Compile PostGIS Geometry columns as TEXT for SQLite tests
@compiles(Geometry, "sqlite")
def compile_geometry_sqlite(type_, compiler, **kw):
    return "TEXT"

# Bypass SpatiaLite DDL event hooks (RecoverGeometryColumn) in plain SQLite
sqlite_admin.before_create = lambda *args, **kwargs: None
sqlite_admin.after_create = lambda *args, **kwargs: None
sqlite_admin.before_drop = lambda *args, **kwargs: None
sqlite_admin.after_drop = lambda *args, **kwargs: None

from app.database import Base, get_db
from app.main import app


# SQLite in-memory engine with foreign key support
SQLALCHEMY_TEST_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Enable foreign keys and register GIS stubs in SQLite
GIS_FUNCS = [
    "GeomFromEWKT", "AsEWKT", "ST_AsEWKT", "GeomFromText", "ST_GeomFromText",
    "AsEWKB", "ST_AsEWKB", "GeomFromWKB", "ST_GeomFromWKB", "GeomFromEWKB", "ST_GeomFromEWKB",
]

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
    for fn in GIS_FUNCS:
        dbapi_connection.create_function(fn, -1, lambda *args: args[0] if args else None)


TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once for the test session."""
    # Import all models so they are registered with Base
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def db():
    """Provide a database session for test helpers."""
    session = TestSessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="session")
def client():
    """Provide a FastAPI test client."""
    return TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def seed_test_data(db, setup_database):
    """Seed minimal test data."""
    from datetime import date
    from app.core.security import hash_password
    from app.models import (
        Agency, Constituency, Project, ProjectStatusEnum, RiskLevelEnum,
        User, UserRoleEnum, SectorGap, GapLevelEnum, WardGap, NeedLevelEnum,
    )

    # Constituency
    c = Constituency(id=1, name="Berasia, Bhopal MP", state="Madhya Pradesh", district="Bhopal")
    db.add(c)

    # Agency
    a = Agency(
        id=1, name="Rural Development Dept.",
        projects_count=48, completion_rate_pct=72, avg_delay_days=42,
        cost_variation_pct=12, stalled_projects=7, update_consistency_pct=68, ai_score=68,
    )
    db.add(a)

    # Project
    p = Project(
        id=1, code="MPLADS/2023/001", name="Construction of Community Hall",
        sector="Community Infrastructure", constituency_id=1, constituency="Berasia, Bhopal MP",
        state="Madhya Pradesh", district="Bhopal", lat=23.4, lng=77.42,
        agency_id=1, agency="Rural Development Dept.",
        status=ProjectStatusEnum.in_progress, risk_level=RiskLevelEnum.high,
        ai_score=32, ai_health_score=32, delay_probability_pct=78, predicted_delay_days=45,
        financial_progress_pct=82, physical_progress_pct=48,
        sanctioned_amount_cr=50, released_amount_cr=42.5, expenditure_cr=41,
        timeline_adherence_pct=40, pending_approvals=3, update_consistency_pct=50,
        start_date=date(2023, 1, 12), expected_end_date=date(2024, 12, 31),
    )
    db.add(p)

    # Second project for priority queue testing
    p2 = Project(
        id=2, code="MPLADS/2023/014", name="Rural Road Development",
        sector="Roads & Transport", constituency_id=1, constituency="Berasia, Bhopal MP",
        state="Madhya Pradesh", district="Bhopal", lat=23.32, lng=77.5,
        agency_id=1, agency="Rural Development Dept.",
        status=ProjectStatusEnum.delayed, risk_level=RiskLevelEnum.high,
        ai_score=45, ai_health_score=55, delay_probability_pct=82, predicted_delay_days=78,
        financial_progress_pct=91, physical_progress_pct=40,
        sanctioned_amount_cr=30, released_amount_cr=27.3, expenditure_cr=27.3,
        timeline_adherence_pct=35, pending_approvals=2, update_consistency_pct=45,
        start_date=date(2022, 11, 1), expected_end_date=date(2024, 6, 30),
    )
    db.add(p2)

    # Sector gaps
    sg = SectorGap(
        constituency_id=1, sector="Drinking Water",
        need=48, need_score=48, covered=13, covered_score=13,
        gap_pct=72, gap_level=GapLevelEnum.high,
    )
    db.add(sg)

    # Ward gaps
    wg = WardGap(
        constituency_id=1, rank=1, area="Kheda", block="Berasia",
        gap_sector="Drinking Water", need_level=NeedLevelEnum.high,
    )
    db.add(wg)

    # Users
    user_mp = User(
        username="testmp",
        hashed_password=hash_password("test123"),
        role=UserRoleEnum.mp,
        display_name="Test MP",
        constituency_id=1,
    )
    user_admin = User(
        username="testadmin",
        hashed_password=hash_password("test123"),
        role=UserRoleEnum.admin,
        display_name="Test Admin",
    )
    db.add_all([user_mp, user_admin])

    db.commit()
