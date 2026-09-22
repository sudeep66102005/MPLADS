# MPLADS backend

FastAPI service for the SIH project: authenticated project records, jurisdiction access, CSV import/export, explainable monitoring rules, private photo evidence and inspection review.

## Local run (Python 3.12)
From `backend/`:

1. Create a virtual environment and install `pip install -r requirements-dev.txt`.
2. Copy `.env.example` to `.env`. Set a unique JWT secret. SQLite works locally.
3. Run `alembic upgrade head`.
4. For your own database, set `BOOTSTRAP_ADMIN_PASSWORD` to a unique password of at least 12 characters, then run `python -m app.bootstrap`. Remove that environment variable afterwards.
5. For synthetic demo data only, explicitly set `DEMO_MODE=true`, then run `python -m app.seed`. Never seed real operational deployments with the public demo passwords.
6. Run `uvicorn app.main:app --host 127.0.0.1 --port 8000`.
7. Open `http://127.0.0.1:8000/docs` or the frontend's Connected Workspace.

Use `POST /api/v1/auth/login` with a JSON username/password; send the returned access token as `Authorization: Bearer <token>`. Sign-out revokes that token. All operational endpoints require authentication.

Run `pytest -q` to verify the backend. CI tests SQLite and PostgreSQL 16. Production startup runs Alembic migrations before starting the server. Database migrations preserve existing tables; backups are required before upgrades.

## Deployment boundary

GitHub Pages serves static browser files. Python, PostgreSQL and uploaded files must run on an API host such as Render. Set the API's `CORS_ALLOW_ORIGINS` to `https://sudeep66102005.github.io` (origin only, no /MPLADS path). Persistent evidence storage is required.

The Docker Compose configuration runs the API and PostgreSQL with persistent volumes. Supply `POSTGRES_PASSWORD` and `JWT_SECRET_KEY` in `.env`, then run `docker compose up --build`. Public demo accounts are created only when DEMO_MODE=true; startup seeds an empty database and preserves existing projects.

## Data and analysis

Money retains the existing API's crore units. CSV import uses a template available at `GET /api/v1/imports/template`; a file is committed only when all rows validate.

Scoring is a versioned rule-based baseline. It compares reported progress against the recorded schedule, flags spending/progress mismatches and missing updates, and saves analysis inputs/results. Delay probabilities and image-derived completion percentages are unavailable, not measured zeros. No live eSAKSHI API access or trained prediction model is claimed.

Photo checks detect exact/perceptual duplicates and compare supplied coordinates. Coordinates are not proof of capture location. Officers record findings; authorized reviewers decide whether to close a case.

The current schema uses latitude/longitude and optional GeoJSON text, so PostGIS is not required. PostGIS can be introduced with a separate migration when spatial query requirements justify it.

## Delivery checkpoints

See `../DELIVERY.md` for the incremental implementation and verification record.

## Free-host runtime

`python -m app.startup` applies migrations, explicitly initializes demo data (only with DEMO_MODE=true) or a private bootstrap account, and starts Uvicorn on PORT. The deployed SIH demo uses database-backed evidence, with a 100 MiB upload quota; Render free PostgreSQL expires on 22 October 2026. See [operations](../docs/DEPLOYMENT.md).

## Optional evaluated delay model

Install `requirements-ml.txt`, then run `python -m training.train_delay --help` for the CSV contract and training command. Historical completed-project snapshots and outcome dates must come from an approved source. The temporal split excludes training outcomes unavailable at the holdout boundary. JSON artifacts include metrics, baseline comparisons and provenance. Configure DELAY_MODEL_PATH only after independent review. Synthetic artifacts are rejected in production.

## Active route modules

`app/main.py` mounts only `api.py`, `evidence_api.py`, `inspection_api.py` and `monitoring_api.py` under `/api/v1`. Legacy `app/routers/` modules are retained for compatibility helpers and are not mounted. Health/readiness and API documentation are public; operational data is authenticated. The original legacy numeric schema fields are overridden by the live serializer so unavailable predictions are returned as null.
