# Delivery checkpoints

Branch: feature/mplads-ai-dashboard. Each completed checkpoint is committed and published separately.

1. Backend startup and database foundation: implemented. Local tests and migrated demo startup verified; PostgreSQL CI runs on publication.
2. Login, roles and jurisdiction permissions: in progress.
3. Project management and imports: planned.
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
