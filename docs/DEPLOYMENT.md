# Free deployment and operations

## Current deployment

- Branch: `feature/mplads-ai-dashboard`.
- Frontend: https://sudeep66102005.github.io/MPLADS/
- API: https://mplads-api-eeux.onrender.com
- Render API service: `mplads-api`, Docker, Oregon, Free (0.1 CPU / 512 MB).
- Database: `mplads-db`, PostgreSQL 16, Oregon, Free (1 GB).
- Database expiry shown by Render: **22 October 2026**.
- No paid disk, paid compute or scheduled job was enabled.

GitHub Pages cannot execute Python or connect directly to PostgreSQL. The frontend uses the public API origin in `frontend/public/backend-config.json`; that file contains no secret. Private DATABASE_URL and JWT_SECRET_KEY are configured only in Render.

## Deploy an update

1. Commit/publish the branch. GitHub Actions installs locked dependencies, checks lint/audit, builds with BASE_PATH=/MPLADS and publishes Pages.
2. For backend changes, use the existing Render service → Manual Deploy → Deploy latest commit. Public Git repository services do not automatically redeploy unless configured through a supported Blueprint/provider integration. Check the displayed source commit before reporting success.
3. Docker runs `python -m app.startup`: migrate, optionally seed an empty demo database, then start one Uvicorn worker. Existing projects are not reset.
4. Verify `/health`, `/ready`, login and scoped records; check the Render deploy status and Pages workflow.

The included `render.yaml` is a **free demonstration** Blueprint for a fresh workspace, with PostgreSQL 16, database evidence storage and explicit demo mode. Do not apply it as a second stack in this account: use the existing services. Review provider pricing if Render changes its free offerings. Never change to a paid plan without the owner's instruction.

## Environment

| Variable | Current purpose |
| --- | --- |
| DATABASE_URL | Render internal PostgreSQL connection; secret |
| JWT_SECRET_KEY | Random private signing key; secret |
| ENVIRONMENT | production (requires a private key and explicit CORS) |
| AUTO_CREATE_TABLES | false; Alembic controls startup schema |
| DEMO_MODE | true; public synthetic accounts/data |
| EVIDENCE_STORAGE | database; no ephemeral filesystem photo loss |
| EVIDENCE_QUOTA_BYTES | defaults to 104857600 (100 MiB) |
| CORS_ALLOW_ORIGINS | https://sudeep66102005.github.io |
| DELAY_MODEL_PATH | unset; no real-data model claimed |

Free web services sleep after inactivity; startup requests may take over 50 seconds. The client allows 90 seconds. Retry a timed-out sign-in. For writes, inspect the refreshed record before repeating a request; photo keys and assignment keys support idempotency, and inspection versions prevent silent lost edits.

## Preserve data before expiry

Free PostgreSQL is temporary and has no durable-backup promise in this setup. Export project reports and evidence while the service is available. CSV reports alone are **not** a complete database backup.

For a complete backup, install PostgreSQL client tools from the official distribution, use the database's External Database URL locally and run `pg_dump --format=custom --file=mplads-backup.dump` with connection parameters supplied privately in your environment. Test a restore with `pg_restore --no-owner --no-privileges --dbname=<new-private-database> mplads-backup.dump`. Keep database dumps encrypted and outside Git: they include account hashes and evidence. Update Render's DATABASE_URL to a restored database before the free one expires. Do not paste a connection URL into repository files, tickets or chat.

No automatic paid upgrade is configured. After expiry, the API may stop working until persistence is replaced. Local Docker Compose with a named PostgreSQL volume is another no-hosting-fee option for running on your own computer; it does not provide public always-on hosting.

## Device/offline behavior

Install the field page from Android's browser menu or Safari's Share → Add to Home Screen. Sign in online first and keep the app open during an offline visit. Save changes explicitly with Save on device. Photos/findings are held in IndexedDB per API origin and user ID. Reopening the app requires online sign-in to recover private drafts. Sign-out keeps local drafts; the clear-device-data action removes them after confirmation. Use only a device under your control. Private API responses and tokens are not cached by the service worker.

A conflict preserves the local draft. Copy findings before using Reload from server, then merge deliberately. GPS is optional device-supplied metadata, not independent proof of location.

## Real-data deployment

Use a separate database, DEMO_MODE=false and a private bootstrap administrator. Do not turn the public demo database into a live government system just by changing its banner. Obtain authorized eSAKSHI access, validate all monitoring assumptions, conduct security/load testing, and provide durable backups and operational support first.
