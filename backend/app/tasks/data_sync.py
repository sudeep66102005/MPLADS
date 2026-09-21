"""Import an approved eSAKSHI export using the same atomic validation as the API.
No live eSAKSHI access is assumed.
Usage: python -m app.tasks.data_sync projects.csv --actor admin
"""
import argparse
import asyncio
from pathlib import Path
from starlette.datastructures import UploadFile
from app.database import SessionLocal
from app.models import User
from app.api import import_projects

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_file", type=Path)
    parser.add_argument("--actor", required=True, help="Existing manager/admin username for audit attribution")
    args = parser.parse_args()
    with SessionLocal() as db, args.csv_file.open("rb") as source:
        actor = db.query(User).filter_by(username=args.actor, is_active=True).first()
        if actor is None:
            raise SystemExit("Unknown or inactive actor")
        result = asyncio.run(import_projects(UploadFile(file=source, filename=args.csv_file.name), actor, db))
        print(result)

if __name__ == "__main__":
    main()
