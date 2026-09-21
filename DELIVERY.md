# Delivery checkpoints

Branch: feature/mplads-ai-dashboard. Each completed checkpoint is committed and published separately.

1. Backend startup and database foundation: implemented. Local tests and migrated demo startup verified; PostgreSQL CI runs on publication.
2. Login, roles and jurisdiction permissions: implemented and tested.
3. Project management and imports: implemented and tested.
4. Explainable scoring and analysis history: planned.
5. Photo evidence and duplicate checks: planned.
6. Inspection workflow and field interface: planned.
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
