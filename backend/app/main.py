"""MPLADS API: authenticated operational workflow and documented analysis limits."""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from app.core.config import settings
from app.database import Base, engine, get_db
from app import models, operational_models
from app.api import router as api
from app.evidence_api import router as evidence
from app.inspection_api import router as inspections

@asynccontextmanager
async def lifespan(app):
    if settings.AUTO_CREATE_TABLES:
        Base.metadata.create_all(engine)
    yield

app = FastAPI(title="MPLADS Monitoring & Audit API", version="1.0.0", lifespan=lifespan,
              description="Authenticated SIH workflow. Analysis uses explainable rules, not trained fraud or delay predictions.")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins_list,
                   allow_credentials=False, allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
                   allow_headers=["Authorization", "Content-Type"])

@app.exception_handler(IntegrityError)
async def conflict(request, exc):
    logging.getLogger(__name__).warning("Database constraint conflict")
    return JSONResponse(status_code=409, content={"detail": "Record conflicts with existing data. Reload and retry."})

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response

for router in (api, evidence, inspections):
    app.include_router(router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok", "service": "mplads-ai-backend", "version": "1.0.0",
            "demoMode": settings.DEMO_MODE, "analysisMethod": "rule-based baseline"}

@app.get("/ready")
def ready(db=Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "unavailable"})
