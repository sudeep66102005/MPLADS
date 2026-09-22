# MPLADS Monitoring & Audit Intelligence — SIH demo

A working monitoring workflow for a six-person SIH team: web dashboard, Android/iPhone field interface, FastAPI backend and PostgreSQL.

- [Open the app](https://sudeep66102005.github.io/MPLADS/)
- [Field inspections](https://sudeep66102005.github.io/MPLADS/field/)
- [API health](https://mplads-api-eeux.onrender.com/health)
- [API documentation](https://mplads-api-eeux.onrender.com/docs)
- [Ten delivery checkpoints](DELIVERY.md)
- [Deployment and operations](docs/DEPLOYMENT.md)

## Try the demonstration

The connection is configured automatically. The free API may take 50–90 seconds to wake after inactivity. If the first request times out, wait and retry.

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `admin123` |
| MP, assigned constituency | `arjun.mehta` | `demo123` |
| Field officer | `inspector.sharma` | `demo123` |
| District authority | `nodal.bhopal` | `demo123` |

These are intentionally public **synthetic-demo accounts**. Never upload confidential documents, personal information or actual government records into this public demo. A real deployment needs a separate database with DEMO_MODE=false and private accounts.

Suggested demo: sign in as admin → Projects → open Construction of Community Hall → assign Ramesh Sharma → open Field app → sign in as inspector → record findings/progress and a sample photo → Save on device → Submit for review → return as admin → Inspections → review and close. Agencies, Coverage and Reports provide analysis of the same saved records.

## Screens and scope

| Screen | Working behavior |
| --- | --- |
| Sign in | Configured API connection, role-based account login; no server URL needed |
| Overview / attention centre | Scoped counts, status distribution, funds and project priority |
| Projects | Search, create, update with conflict detection, import CSV, explanations, milestones and revision history |
| Project evidence | Private photo upload/download, duplicate candidates, supplied-location distance |
| Monitoring checks | Cost benchmark with source, nearby similar-work candidates, documentation completeness |
| Map | Actual accessible project coordinates on OpenStreetMap |
| Agencies | Visible project count, completion rate, current overdue days and average rule-based health |
| Coverage | Dated service-needs measurements with source and consistent units |
| Inspections | Assignment, draft, submission, clarification, closure, reopening and dossier export |
| Reports | Printable project report, CSV, fund summaries and audit export |
| Administration | Constituencies, agencies, users, activation/deactivation and additional jurisdiction grants |
| Field app | Officer assignments, device drafts, queued photos, optional GPS and authenticated sync |
| Sample dashboard | Original visual prototype, explicitly marked as illustrative data |

## Analysis — what is and is not claimed

Health/priority use versioned rules with explanations. Delay-model training and safe JSON inference are provided, including temporal holdout and baseline evaluation, but no trained real-world model is deployed. Without one, probabilities/delay predictions remain unavailable. Duplicate images/work and possible splitting are candidates for human investigation. Cost comparisons require a supplied comparable benchmark. Record completeness is not a legal compliance certification. No image-derived physical completion percentage is claimed.

Data enters through validated CSV or API writes. Live eSAKSHI integration requires an approved data contract and credentials; the app does not pretend to have that connection.

## Architecture

```text
GitHub Pages: Next.js / React / TypeScript
  ├─ Dashboard (authenticated API calls)
  └─ Field PWA (IndexedDB drafts/photos; explicit synchronization)
                 │ HTTPS + bearer token
Render Free: FastAPI / SQLAlchemy / Alembic / Pillow
                 │ private database connection
Render PostgreSQL 16: records, roles, audit, analysis history and evidence bytes
```

No paid AI API, app-store account, PostGIS extension or persistent disk is required for this demo. Photo storage has a 100 MiB application quota inside the free 1 GB database. The created database expires **22 October 2026**. See the operations guide before expiry.

## Local development

Backend: follow [backend/README.md](backend/README.md), using Python 3.12. SQLite is supported locally; CI tests PostgreSQL 16 too.

Frontend: Node.js 22, `cd frontend`, `npm ci`, `npm run dev`. For local backend development set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in an ignored `.env.local`; that overrides public deployment configuration. Use the same host in backend CORS settings. `npm run build` exports static files to `frontend/out`.

Verification: `pytest -q` in backend (install both requirements-dev.txt and requirements-ml.txt for all 38 tests); `npm run build`, `npm run lint`, `npm audit` in frontend. No sensitive environment values belong in Git.

## Team ownership

1. ML: collect approved historical outcomes, evaluate delay models, document limitations.
2. Vision: curate labeled images and review duplicate false positives; validate any future vision model.
3. Data: approved imports, data quality, sourced coverage and comparable cost benchmarks.
4. Backend: permissions, migrations, inspection state machine and API contracts.
5. Dashboard: user research, charts, maps, accessibility and report usability.
6. Field/integration: PWA offline workflow, device testing, free-host operations and releases.

This release is an SIH pilot. Production adoption requires domain validation, independent security/load review, durable backups, approved data access and a sustainable hosting arrangement.
