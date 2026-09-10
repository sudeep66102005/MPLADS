# MPLADS AI Backend (skeleton)

Python / FastAPI backend implementing the "Backend API" and "AI Engine"
boxes from the system architecture diagram. This is a **runnable skeleton**,
not the finished production service — the goal is to establish the module
boundaries (routers, schemas, AI engine, data layer) so Person 3 (Data &
Anomaly), Person 1 (ML / Prediction) and Person 4 (Backend Developer) can
build in parallel against a shared contract.

## What's implemented

- FastAPI app (`app/main.py`) with CORS, health check, and routers for
  Auth, Projects, Agencies, Constituencies, and direct AI Engine access.
- Pydantic schemas (`app/schemas.py`) mirroring the frontend's TypeScript
  types 1:1, so the dashboard and API agree on field names/shapes.
- An in-memory mock data store (`app/mock_store.py`) standing in for
  PostgreSQL + PostGIS until the real database is provisioned.
- A rule-based AI scoring module (`app/ai_engine/scoring.py`) implementing
  transparent, explainable baselines for:
  - AI Project Health Score
  - AI Delay Prediction
  - Automatic Anomaly Detection (expenditure/progress mismatch, stale
    updates, pending-approval backlog)
- Unit tests (`tests/`) for the scoring logic and the API endpoints.

## What's intentionally NOT implemented yet

- Real database models/migrations (SQLAlchemy models + Alembic — the
  `mock_store.py` module is the seam to replace).
- Real authentication (JWT issuance/verification, role-based access
  control tied to actual eSAKSHI-equivalent accounts).
- Computer-vision photo verification (duplicate/unrelated image
  detection, cross-stage comparison) — needs an actual image pipeline
  and labeled data.
- Agency Performance Score and Constituency Development Gap Analysis are
  currently served from static mock data (`mock_store.py`), not computed
  from real project roll-ups yet.
- eSAKSHI data ingestion/sync job (the "API / Data Import" arrow in the
  architecture diagram).

## Running locally

This sandbox environment does not have outbound access to PyPI, so
dependencies could not be installed or the server smoke-tested here.
Syntax was verified with `python -m py_compile`. On a machine with normal
internet access:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # adjust as needed
uvicorn app.main:app --reload --port 8000
```

Then visit `http://localhost:8000/docs` for interactive OpenAPI docs.

Run tests:

```bash
pytest
```

## API surface (v1)

| Method | Path                                       | Purpose |
|--------|---------------------------------------------|---------|
| POST   | `/api/v1/auth/login`                        | Placeholder login (role-scoped) |
| GET    | `/api/v1/projects`                          | List projects (filterable) |
| GET    | `/api/v1/projects/priority-queue`           | AI-ranked priority queue |
| GET    | `/api/v1/projects/{id}`                     | Project detail |
| GET    | `/api/v1/projects/{id}/ai-analysis`         | Health score, delay prediction, anomaly flags |
| GET    | `/api/v1/agencies`                          | Agency performance list |
| GET    | `/api/v1/agencies/{id}`                     | Agency performance detail |
| GET    | `/api/v1/constituencies/{id}/sector-gaps`   | Sector-wise coverage vs need |
| POST   | `/api/v1/ai/projects/{id}/rescore`          | Re-run AI scoring for one project |
| GET    | `/health`                                   | Liveness check |
