"""
AI Engine — Photo Verification stub interface.

This module provides the integration points for the Computer Vision (CV)
pipeline — Person 2's domain. The function signatures define the contract;
implementations return placeholder results until the real CV models are
plugged in.

Expected capabilities:
  - Verify photo against reported progress stage
  - Detect duplicate/unrelated images across projects
  - Validate geo-metadata (EXIF GPS vs. project location)
"""

from __future__ import annotations

from pydantic import BaseModel


class PhotoVerificationResult(BaseModel):
    photo_url: str
    is_relevant: bool | None = None  # None = not yet verified
    confidence: float = 0.0  # 0-1
    notes: str = ""


class DuplicateCheckResult(BaseModel):
    photo_url: str
    is_duplicate: bool = False
    matched_photo_url: str | None = None
    similarity_score: float = 0.0


class GeoValidationResult(BaseModel):
    photo_url: str
    has_gps_data: bool = False
    distance_from_project_km: float | None = None
    is_within_threshold: bool | None = None


def verify_photo(project_id: int, photo_url: str) -> PhotoVerificationResult:
    """Verify a photo against reported project progress.

    TODO (Person 2): Replace with actual CV model inference.
    """
    return PhotoVerificationResult(
        photo_url=photo_url,
        is_relevant=None,
        confidence=0.0,
        notes="CV pipeline not yet implemented — stub result.",
    )


def detect_duplicate(photo_url: str, existing_photos: list[str]) -> DuplicateCheckResult:
    """Check if a photo is a duplicate of any existing project photos.

    TODO (Person 2): Replace with perceptual hashing or embedding similarity.
    """
    return DuplicateCheckResult(
        photo_url=photo_url,
        is_duplicate=False,
        matched_photo_url=None,
        similarity_score=0.0,
    )


def validate_geo_metadata(photo_exif: dict, project_lat: float, project_lng: float) -> GeoValidationResult:
    """Validate photo GPS metadata against the project's known location.

    TODO (Person 2): Extract EXIF GPS, compute haversine distance, flag
    if > threshold (e.g. 5 km).
    """
    return GeoValidationResult(
        photo_url=photo_exif.get("file_url", ""),
        has_gps_data=False,
        distance_from_project_km=None,
        is_within_threshold=None,
    )
