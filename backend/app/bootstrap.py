"""Explicit first-user creation. Secrets come from environment, never source control."""
import os
from app.database import Base, engine, SessionLocal
from app import models, operational_models
from app.core.security import hash_password

def main():
    Base.metadata.create_all(engine)
    username = os.environ.get("BOOTSTRAP_ADMIN_USERNAME", "admin")
    password = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD", "")
    if len(password) < 12:
        raise SystemExit("Set BOOTSTRAP_ADMIN_PASSWORD to a unique password of at least 12 characters")
    with SessionLocal() as db:
        if db.query(models.User).filter_by(username=username).first():
            print("Admin already exists; password unchanged.")
            return
        db.add(models.User(username=username, hashed_password=hash_password(password),
                           display_name="System Administrator", role=models.UserRoleEnum.admin))
        db.commit()
    print("Administrator created. Remove BOOTSTRAP_ADMIN_PASSWORD from the environment.")

if __name__ == "__main__":
    main()
