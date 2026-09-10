"""Constituency-level endpoints — backs the Constituency Insights page and
the "Constituency Development Gap Analysis" AI feature."""

from __future__ import annotations

from fastapi import APIRouter

from app import mock_store
from app.schemas import SectorGapOut

router = APIRouter()


@router.get("/{constituency_id}/sector-gaps", response_model=list[SectorGapOut])
def get_sector_gaps(constituency_id: str) -> list[dict]:
    """Sector-wise coverage-vs-need gap analysis for a constituency.

    `constituency_id` is currently unused by the mock store (single demo
    dataset) — once real data is wired up this should scope the query to
    the given constituency.
    """
    return mock_store.list_sector_gaps()
