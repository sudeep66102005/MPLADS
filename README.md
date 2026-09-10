# MPLADS AI Monitoring & Audit Intelligence

_SIH26102 · An explainable AI decision-support layer on top of eSAKSHI /
MPLADS — smarter oversight, greater impact._

## What this is

MPLADS (Members of Parliament Local Area Development Scheme) generates a
constant stream of project, financial, progress and photo data across
every MP's constituency in India. Today that data lives in **eSAKSHI**,
the Government of India's live MPLADS platform — which stores and reports
it well, but does not rank, predict, or explain it. A human still has to
manually go through hundreds of projects to find the ones that need
attention.

This project adds an **AI intelligence layer on top of eSAKSHI** — not a
replacement. It reads the same project/financial/progress/photo/location
data, applies rule-based checks and ML models, and produces one clear,
explainable output: an ordered priority list of which projects a human
officer should look at first, and exactly why. It never declares fraud —
only "this needs a closer human look, and here is what to check." The
final decision always stays with the authorized official.

```
RAW DATA → AI ANALYSIS → PRIORITY LIST → HUMAN REVIEW → ACTION
```

## Research basis — what eSAKSHI already does, and the gap this fills

eSAKSHI already provides: stakeholder logins (MP / MoSPI / State & District
Nodal Authorities / Implementing Agencies), work recommendation and fund
workflows, a public dashboard of works recommended/sanctioned/completed
with expenditure drill-downs, photo uploads for completed works, and public
reports (fund releases, expenditure, work registers, non-progress works).
(Source: [mplads.gov.in dashboard](https://mplads.gov.in/mplads/Dashboard/DashBoard.aspx),
MPLADS portal user manual and FAQ, and Lok Sabha/Rajya Sabha unstarred
question replies from the Ministry of Statistics & Programme Implementation
on eSAKSHI's digital fund-flow and monitoring capabilities, e.g.
[sansad.in AU2887](https://sansad.in/getFile/lsapps/loksabhaquestions/annex/188/AU2887_YqZH4s.pdf?source=lsapps).)

What it does **not** do today: connect expenditure and physical-progress
records to flag abnormal patterns, rank/prioritize which projects deserve
attention first, verify photos against reported progress or catch
duplicates, predict which on-track projects are likely to slip before they
do, roll individual project records up into an agency-level performance
score, link past spending to real local need (development gaps), or close
an inspection/feedback loop. These seven gaps map directly to the seven AI
features below.

## The 7 AI features (and where each lives in this repo)

| # | Feature | Frontend | Backend |
|---|---|---|---|
| 1 | AI Project Health Score | Project Detail page, Projects list | `ai_engine/scoring.py::compute_health_score` |
| 2 | AI Delay Prediction | Project Detail, Map View popup | `ai_engine/scoring.py::compute_delay_probability` |
| 3 | AI Progress & Photo Verification | Project Detail "Photos" tab (UI only) | not implemented — needs a CV pipeline (see backend README) |
| 4 | Automatic Anomaly Detection | MP Attention Centre, Project Detail risk indicators | `ai_engine/scoring.py::detect_anomalies` |
| 5 | Implementing Agency Performance Score | `/agency-performance` | `routers/agencies.py` (mock data — roll-up logic not yet computed from projects) |
| 6 | Constituency Development Gap Analysis | `/constituency-insights` | `routers/constituencies.py` (mock data) |
| 7 | MP Attention Centre | `/mp-attention-centre` | composes projects + agencies + gaps endpoints |

## Team structure (as given)

| Person | Role | Owns |
|---|---|---|
| 1 | ML / Prediction | Project Health Score, Delay Prediction, model training & evaluation |
| 2 | Vision (Computer Vision) | Photo verification, image analysis, duplicate/unrelated photo & geo-location validation |
| 3 | Data & Anomaly | Data collection/processing, anomaly detection, agency performance, data pipeline |
| 4 | Backend Developer | FastAPI backend, database design, APIs & integration, auth & security |
| 5 | Dashboard Developer | React/Next.js frontend, dashboard UI/UX, charts, maps, role-based views |
| 6 | Mobile / Integration | Field officer mobile interface, inspection workflow, system integration, deployment |

## System architecture

```
eSAKSHI / MPLADS DATA  →  BACKEND API (Python/FastAPI)  →  DATABASE (PostgreSQL + PostGIS)
                                    ↓                              ↕
                            AI ENGINE (ML + Vision)  ←──────────────
                                    ↓
                        RISK / AI RESULTS (0-100 score, explanations)
                                    ↓
              ┌─────────────────────┴─────────────────────┐
       WEB DASHBOARD (React/Next.js)              MOBILE APP (optional, field officer)
```

## Repository layout

```
MPLADS/
├── frontend/     Next.js + TypeScript + Tailwind dashboard (see frontend/README.md)
└── backend/      FastAPI backend + rule-based AI scoring skeleton (see backend/README.md)
```

## Sandbox limitation note

This build was authored in a network-restricted sandbox: outbound requests
to the npm registry and PyPI both returned `403` through the environment's
proxy (`INTEGRATIONS_ONLY` network mode), so `npm install`, `create-next-app`,
and `pip install` could not be run here, and neither app could be
build/smoke-tested in this session. Every frontend and backend file was
hand-authored to match what those tools would scaffold, and syntax was
verified with the TypeScript/Python compilers where possible
(`tsc`/`py_compile`). **Run `npm install && npm run build` (frontend) and
`pip install -r requirements.txt && pytest` (backend) on a machine with
normal internet access before treating this as verified-working code.**
