# Delivery checkpoints

Branch: feature/mplads-ai-dashboard. Each completed checkpoint is committed and published separately.

1. Backend startup and database foundation: implemented. Local tests and migrated demo startup verified; PostgreSQL CI runs on publication.
2. Login, roles and jurisdiction permissions: implemented and tested.
3. Project management and imports: implemented and tested.
4. Explainable scoring and analysis history: implemented and tested.
5. Photo evidence and duplicate checks: implemented and tested.
6. Inspection workflow and field interface: implemented and tested.
7. Dashboard integration: implemented and tested.
8. Agencies, reports and sourced coverage: implemented and tested.
9. End-to-end verification and fixes: implemented and tested.
10. Free deployment and release configuration: implemented; final Pages acceptance checked after publication.

## Checkpoint 1
Introduces the previously prepared operational backend foundation, explicit migrations, seeded demonstration mode, administrator bootstrap, persistent deployment configuration and SQLite/PostgreSQL CI. Subsequent checkpoints complete and harden each workflow on this foundation.

Hosting boundary: GitHub Pages serves the frontend; Render will host the API/database. Runtime hosting is not yet deployed.

## Checkpoint 2
Added account deactivation, additional access listing/revocation, bounded login inputs, and regression coverage for expired tokens, existing-session revocation, cross-origin requests and administrator-only changes. Nine auth tests pass. Checkpoint 1 also passed GitHub CI on SQLite and PostgreSQL.

## Checkpoint 3
Added immutable project revisions, stale-edit protection, strict CSV column/header validation and a CLI importer for approved exports. Project API regression tests pass, including atomic rollback and repeat imports.

## Checkpoint 4
Completed versioned rule explanations and source-timestamp preservation. Added safe JSON inference and an optional delay-training pipeline with temporal holdout, known-outcome filtering, baseline comparisons and recorded dataset provenance. Synthetic artifacts are rejected in production. No real-data accuracy is claimed.

## Checkpoint 5
Added optional database-backed photo storage for free hosts, authenticated original downloads, bounded image validation and duplicate-check safeguards for flat images. Evidence regression tests verify persistence independent of the filesystem and enforce authorization and upload limits.

## Checkpoint 6
Added the Android/iPhone browser field app with explicit device draft saves, queued photos, GPS attachment, authenticated synchronization, version-conflict protection and authority review/reopen workflow. Offline editing works while the signed-in app remains open; reopening requires an online sign-in before private drafts can be recovered. Device data can be cleared per account. The service worker caches public application files only. State-machine regression covers clarification, reopening, stale updates and unauthorized submission.

## Checkpoint 7
The main entry now opens the connected dashboard, with scoped overview, priority queue, map, project creation/updates, imports, evidence, inspections, reports and account administration. The original design is preserved at /demo with a sample-data banner. Project updates send a revision timestamp to prevent silent stale edits. API failures show actionable errors instead of falling back to mock data.

## Checkpoint 8
Added sourced cost benchmarks, scoped geographic/name duplicate-work candidates, documentation-completeness checks, recorded financial history, agency comparisons, printable reports and coverage measurement entry with provenance/units. Duplicate or split-work flags are review candidates; no fraud determination or statutory compliance claim is made. Scores returned to the dashboard use current dates rather than stale cached values.

## Checkpoint 9
Verified the browser workflow from authority assignment through officer device-save/submission and authority closure. Updated Next.js to 15.5.25 and PostCSS to 8.5.28, including the nested dependency, and locked dependencies; npm audit reports zero vulnerabilities. CI now runs model-training tests, enforces lint/audit and installs from the lockfile. Added a database evidence quota for free hosting and app icons. Local backend regression and static export passed.

## Checkpoint 10
Render API: https://mplads-api-eeux.onrender.com. The free PostgreSQL 16 database and free Docker web service were created; migrations and demo initialization succeeded. Runtime configuration connects the Pages frontend automatically, so normal sign-in needs no server address. GitHub CI for checkpoint 9 passed on SQLite/PostgreSQL and published the frontend. Final acceptance includes the deployed health endpoint, scoped sign-in, Pages workflow and live browser login.

Cost boundary: only $0 Render plans were selected, with no disk or paid add-ons. The created free database expires on **22 October 2026**. Export/backup before expiry; permanent operation needs another persistence arrangement. No paid upgrade is authorized.

This is a working SIH demonstration, not a production government system. No eSAKSHI credentials/data feed, validated real-data prediction accuracy, forensic photo verification or statutory compliance certification is available. Native store distribution is outside this release; the field app runs in Android/iOS browsers and supports home-screen installation.
