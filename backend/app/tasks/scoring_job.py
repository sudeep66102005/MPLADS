"""Run with python -m app.tasks.scoring_job; schedule daily on the API host."""
from app.database import SessionLocal
from app.models import Project
from app.services import score

def run_scoring_job():
    with SessionLocal() as db:
        projects = db.query(Project).filter(Project.is_deleted.is_(False)).all()
        for project in projects:
            score(db, project)
        db.commit()
        print(f"Saved {len(projects)} rule-based analysis snapshots.")

if __name__ == "__main__":
    run_scoring_job()
