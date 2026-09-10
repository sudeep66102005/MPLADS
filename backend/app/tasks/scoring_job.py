"""Scheduled batch AI rescoring job.

Run manually:
    python -m app.tasks.scoring_job

Or trigger via cron / task scheduler:
    0 2 * * * cd /path/to/backend && python -m app.tasks.scoring_job
"""

from __future__ import annotations

import logging

from app.ai_engine.scoring import score_all_projects
from app.database import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_scoring_job():
    """Score all projects and persist results."""
    logger.info("Starting batch AI rescoring job...")
    db = SessionLocal()
    try:
        count = score_all_projects(db)
        logger.info(f"Successfully scored {count} projects.")
    except Exception:
        logger.exception("Scoring job failed")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_scoring_job()
