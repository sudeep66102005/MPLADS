"""
SQLAlchemy database engine, session factory, and FastAPI dependency.

This module replaces the in-memory ``mock_store.py`` with a real database
connection. All routers use ``get_db()`` as a FastAPI dependency to obtain
a scoped session per request.
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine_kwargs: dict = {}

if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

    # SQLite compatibility for GeoAlchemy2 / SpatiaLite
    from geoalchemy2 import Geometry
    import geoalchemy2.admin.dialects.sqlite as sqlite_admin
    from sqlalchemy.ext.compiler import compiles

    @compiles(Geometry, "sqlite")
    def _compile_geometry_sqlite(type_, compiler, **kw):
        return "TEXT"

    sqlite_admin.before_create = lambda *args, **kwargs: None
    sqlite_admin.after_create = lambda *args, **kwargs: None
    sqlite_admin.before_drop = lambda *args, **kwargs: None
    sqlite_admin.after_drop = lambda *args, **kwargs: None
else:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

if is_sqlite:
    from sqlalchemy import event

    _GIS_FUNCS = [
        "GeomFromEWKT", "AsEWKT", "ST_AsEWKT", "GeomFromText", "ST_GeomFromText",
        "AsEWKB", "ST_AsEWKB", "GeomFromWKB", "ST_GeomFromWKB", "GeomFromEWKB", "ST_GeomFromEWKB",
    ]

    @event.listens_for(engine, "connect")
    def _setup_sqlite_gis(dbapi_connection, _):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
        for fn in _GIS_FUNCS:
            dbapi_connection.create_function(fn, -1, lambda *args: args[0] if args else None)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session and closes it after the
    request completes (even on error)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
