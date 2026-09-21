import os
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", "sqlite://")
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-at-least-32-characters"
os.environ["AUTO_CREATE_TABLES"] = "false"

import pytest
from datetime import date, timedelta, datetime, timezone
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.database import Base, get_db
from app.main import app
from app.core.config import settings
from app.core.security import hash_password
from app import models as m
from app.services import score

@pytest.fixture
def db(tmp_path):
    url = os.environ.get("TEST_DATABASE_URL", "sqlite://")
    args = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool} if url.startswith("sqlite") else {}
    engine = create_engine(url, **args)
    if url.startswith("sqlite"):
        @event.listens_for(engine, "connect")
        def fk(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    with Session() as session:
        session.add_all([m.Constituency(id=1, name="District One", district="One", state="State"),
                         m.Constituency(id=2, name="District Two", district="Two", state="State"),
                         m.Agency(id=1, name="Works Agency")])
        session.flush()
        pwd = hash_password("test-password")
        for username, rolename, cid in [
            ("admin", m.UserRoleEnum.admin, None), ("mp", m.UserRoleEnum.mp, 1),
            ("officer", m.UserRoleEnum.inspecting_officer, 1),
            ("otherofficer", m.UserRoleEnum.inspecting_officer, 2),
            ("nodal", m.UserRoleEnum.district_nodal_authority, 1),
            ("agency", m.UserRoleEnum.implementing_agency, 1)]:
            session.add(m.User(username=username, hashed_password=pwd, role=rolename, display_name=username, constituency_id=cid))
        session.flush()
        for i in [1, 2]:
            p = m.Project(id=i, code=f"P-{i}", name=f"Project {i}", sector="Water",
                constituency_id=i, constituency=f"District {i}", district=str(i), state="State",
                agency_id=1, agency="Works Agency", lat=23.4, lng=77.4, status=m.ProjectStatusEnum.in_progress,
                sanctioned_amount_cr=1, released_amount_cr=.8, expenditure_cr=.7,
                financial_progress_pct=70, physical_progress_pct=20, timeline_adherence_pct=90,
                update_consistency_pct=90, pending_approvals=0,
                start_date=date.today()-timedelta(days=50), expected_end_date=date.today()+timedelta(days=50),
                updated_at=datetime.now(timezone.utc).replace(tzinfo=None))
            session.add(p)
            session.flush()
            score(session, p)
        session.commit()
        if engine.dialect.name == "postgresql":
            from sqlalchemy import text
            for table in Base.metadata.sorted_tables:
                if "id" in table.c and str(table.c.id.type) == "INTEGER":
                    session.execute(text(f"SELECT setval(pg_get_serial_sequence('{table.name}', 'id'), COALESCE((SELECT MAX(id) FROM {table.name}), 1), EXISTS(SELECT 1 FROM {table.name}))"))
            session.commit()
        def override():
            try:
                yield session
            except Exception:
                session.rollback()
                raise
        app.dependency_overrides[get_db] = override
        previous = settings.UPLOAD_DIR
        settings.UPLOAD_DIR = str(tmp_path / "uploads")
        yield session
        settings.UPLOAD_DIR = previous
        app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()

@pytest.fixture
def client(db):
    with TestClient(app) as client:
        yield client

@pytest.fixture
def headers(client):
    def login(name="admin"):
        r = client.post("/api/v1/auth/login", json={"username": name, "password": "test-password"})
        assert r.status_code == 200, r.text
        return {"Authorization": "Bearer " + r.json()["accessToken"]}
    return login
