# Delivery checkpoints

Branch: feature/mplads-ai-dashboard. Each completed checkpoint is committed and published separately.

1. Backend startup and database foundation: implemented. Local tests and migrated demo startup verified; PostgreSQL CI runs on publication.
2. Login, roles and jurisdiction permissions: implemented and tested.
3. Project management and imports: implemented and tested.
4. Explainable scoring and analysis history: implemented and tested.
5. Photo evidence and duplicate checks: implemented and tested.
6. Inspection workflow and field interface: implemented and tested.
7. Dashboard integration: planned.
8. Agencies, reports and sourced coverage: planned.
9. End-to-end verification and fixes: planned.
10. Deployment and release verification: planned.

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
