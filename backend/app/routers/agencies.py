"""Agency performance endpoints — backs the Agency Performance page and
the "Implementing Agency Performance Score" AI feature."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app import mock_store
from app.schemas import AgencyOut

router = APIRouter()


@router.get("", response_model=list[AgencyOut])
def list_agencies() -> list[dict]:
    return mock_store.list_agencies()


@router.get("/{agency_id}", response_model=AgencyOut)
def get_agency(agency_id: str) -> dict:
    agency = mock_store.get_agency(agency_id)
    if agency is None:
        raise HTTPException(status_code=404, detail="Agency not found")
    return agency
