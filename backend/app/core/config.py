"""
Application configuration using pydantic-settings.

Loads from environment variables / .env file. All backend configuration
is centralized here so routers and services never read os.environ directly.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
import secrets


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # .env also contains Compose/bootstrap settings
    )

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+psycopg://mplads:mplads@localhost:5432/mplads_ai"

    # ── JWT / Auth ────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_BYTES: int = 8 * 1024 * 1024
    AUTO_CREATE_TABLES: bool = True
    DEMO_MODE: bool = False
    DELAY_MODEL_PATH: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000"

    @model_validator(mode="after")
    def validate_deployment(self):
        if self.JWT_SECRET_KEY == "change-me-in-production":
            if self.ENVIRONMENT == "production":
                raise ValueError("Set a private JWT_SECRET_KEY for production")
            self.JWT_SECRET_KEY = secrets.token_urlsafe(48)
        if self.ENVIRONMENT == "production" and (len(self.JWT_SECRET_KEY) < 32 or "*" in self.cors_origins_list):
            raise ValueError("Production requires a 32+ character JWT secret and explicit CORS origins")
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOW_ORIGINS.split(",") if o.strip()]


settings = Settings()
