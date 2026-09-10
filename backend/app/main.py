"""
MPLADS AI Monitoring & Audit Intelligence — Backend API.

This is the entry point of the Backend API service described in the system
architecture: Python / FastAPI, handling business logic, API endpoints,
authentication & role management, and connecting the Database to the AI
Engine. It sits between the eSAKSHI/MPLADS data ingestion layer and the
Web Dashboard / Mobile App consumers.

    eSAKSHI / MPLADS DATA -> BACKEND API -> DATABASE (Postgres+PostGIS)
                                          -> AI ENGINE (ML + Vision)
                                          -> RISK / AI RESULTS
                                          -> WEB DASHBOARD / MOBILE APP

Run locally:
    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import agencies, ai_scoring, auth, constituencies, dashboard, inspections, projects, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-create tables and models on startup."""
    from app.database import Base, engine
    from app import models  # noqa: F401 — ensure models are registered
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MPLADS AI Monitoring & Audit Intelligence API",
    description=(
        "Explainable AI decision-support layer on top of eSAKSHI / MPLADS data. "
        "Exposes project health scores, delay predictions, anomaly flags, agency "
        "performance and constituency development-gap analysis. Read/write of raw "
        "MPLADS records stays with eSAKSHI; this API layers AI analysis on top."
    ),
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware — tighten before production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(agencies.router, prefix="/api/v1/agencies", tags=["Agencies"])
app.include_router(constituencies.router, prefix="/api/v1/constituencies", tags=["Constituencies"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(inspections.router, prefix="/api/v1/inspections", tags=["Inspections"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(ai_scoring.router, prefix="/api/v1/ai", tags=["AI Engine"])


@app.get("/health", tags=["System"])
def health_check() -> dict:
    return {"status": "ok", "service": "mplads-ai-backend", "version": "0.2.0"}
