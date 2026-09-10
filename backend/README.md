# MPLADS AI Backend

Python / FastAPI backend implementing the **Backend API** and **AI Engine**
from the system architecture diagram. Provides RESTful APIs for the
dashboard, real JWT authentication, PostgreSQL + PostGIS database, and
explainable AI scoring.

## Quick Start

### 1. Start PostgreSQL (Docker)

```bash
cd backend
docker-compose up -d
```

This starts PostgreSQL 16 + PostGIS 3.4 on `localhost:5432` and pgAdmin
on `localhost:5050`.

### 2. Install Dependencies

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose)
```

### 4. Seed the Database

```bash
python -m app.seed
```

This creates all tables and populates them with demo data matching the
frontend's mockData.ts.

### 5. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs for interactive Swagger docs.

### 6. Run Tests

```bash
pytest -v
```

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `arjun.mehta` | `demo123` | MP |
| `admin` | `admin123` | Admin |
| `inspector.sharma` | `demo123` | Inspecting / Field Officer |
| `nodal.bhopal` | `demo123` | District Nodal Authority |

## API Reference (v0.2.0)

### Auth
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login` | JWT login |
| GET | `/api/v1/auth/me` | Current user profile |
| POST | `/api/v1/auth/register` | Create user (admin only) |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |

### Projects
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/projects` | List projects (paginated, filterable, sortable) |
| GET | `/api/v1/projects/all` | All projects (for maps/charts) |
| GET | `/api/v1/projects/priority-queue` | AI-ranked priority queue |
| GET | `/api/v1/projects/{id}` | Project detail |
| POST | `/api/v1/projects` | Create project |
| PATCH | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Soft-delete project |
| GET | `/api/v1/projects/{id}/ai-analysis` | AI health/delay/anomaly analysis |
| GET | `/api/v1/projects/{id}/timeline` | Project milestones |
| GET | `/api/v1/projects/{id}/photos` | Project photos |
| GET | `/api/v1/projects/{id}/financial-trend` | Quarterly financial data |
| GET | `/api/v1/projects/{id}/radar` | Radar chart data |

### Dashboard
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/dashboard/kpis` | Aggregate KPIs |
| GET | `/api/v1/dashboard/sector-distribution` | Sector pie chart |
| GET | `/api/v1/dashboard/top-issues` | AI-identified top issues |
| GET | `/api/v1/dashboard/ai-insights` | Natural-language AI insights |

### Agencies
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/agencies` | List agencies |
| GET | `/api/v1/agencies/{id}` | Agency detail |
| GET | `/api/v1/agencies/{id}/projects` | Agency's projects |

### Constituencies
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/constituencies` | List constituencies |
| GET | `/api/v1/constituencies/{id}` | Constituency detail |
| GET | `/api/v1/constituencies/{id}/kpis` | Constituency KPIs |
| GET | `/api/v1/constituencies/{id}/sector-gaps` | Sector gap analysis |
| GET | `/api/v1/constituencies/{id}/ward-gaps` | Ward-level gaps |
| GET | `/api/v1/constituencies/{id}/investment-trend` | Year-over-year trend |
| GET | `/api/v1/constituencies/{id}/recommendations` | AI recommendations |

### Inspections
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/inspections` | List inspections |
| POST | `/api/v1/inspections` | Create inspection |
| GET | `/api/v1/inspections/{id}` | Inspection detail |
| PATCH | `/api/v1/inspections/{id}` | Update inspection |

### Reports
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/reports/fund-utilization` | Fund utilization report |
| GET | `/api/v1/reports/project-status` | Project status summary |
| GET | `/api/v1/reports/export` | CSV export |

### AI Engine
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/ai/projects/{id}/rescore` | Re-score single project |
| POST | `/api/v1/ai/rescore-all` | Batch re-score all projects |

### System
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness check |

## Architecture

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Pydantic Settings (env vars)
│   │   └── security.py        # JWT + bcrypt auth
│   ├── ai_engine/
│   │   ├── scoring.py         # Health score, delay prediction, anomalies
│   │   └── photo_verification.py  # CV pipeline stub (Person 2)
│   ├── routers/
│   │   ├── auth.py            # JWT login/register/me/refresh
│   │   ├── projects.py        # Project CRUD + sub-resources
│   │   ├── agencies.py        # Agency performance
│   │   ├── constituencies.py  # Constituency insights + gaps
│   │   ├── dashboard.py       # Dashboard KPIs + aggregates
│   │   ├── inspections.py     # Inspection dossier CRUD
│   │   ├── reports.py         # Reports + CSV export
│   │   └── ai_scoring.py      # Direct AI engine access
│   ├── tasks/
│   │   ├── scoring_job.py     # Batch AI rescoring
│   │   └── data_sync.py       # eSAKSHI data ingestion stub
│   ├── database.py            # SQLAlchemy engine + session
│   ├── models.py              # ORM models (14 tables)
│   ├── schemas.py             # Pydantic schemas (camelCase output)
│   ├── seed.py                # Database seed script
│   └── main.py                # FastAPI app entry point
├── tests/
│   ├── conftest.py            # Test fixtures (SQLite in-memory)
│   ├── test_api.py            # API endpoint tests
│   ├── test_auth.py           # Auth flow tests
│   └── test_ai_engine.py      # AI scoring tests
├── docker-compose.yml         # PostgreSQL + PostGIS + pgAdmin
├── requirements.txt
├── .env.example
└── README.md
```

## Integration Points for Team

- **Person 1 (ML/Prediction):** Plug trained models into
  `app/ai_engine/scoring.py` — same function signatures, swap rule-based
  heuristics for gradient-boosting/etc.
- **Person 2 (Vision/CV):** Implement the stubs in
  `app/ai_engine/photo_verification.py` — photo verification, duplicate
  detection, geo-metadata validation.
- **Person 3 (Data/Anomaly):** Extend `detect_anomalies()` in scoring.py
  and add time-series analysis; extend data sync in `app/tasks/data_sync.py`.
- **Person 5 (Dashboard):** Replace `mockData.ts` imports with `fetch()`
  calls to the endpoints above. All JSON output is camelCase.
- **Person 6 (Mobile):** Use the same REST API from the mobile app.
