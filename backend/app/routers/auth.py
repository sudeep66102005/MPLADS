"""
Authentication & role management (skeleton).

Mirrors the "same access boundaries as eSAKSHI" requirement: this AI layer
does not invent new users — it re-uses the existing MPLADS stakeholder
roles (MP, District/State Nodal Authority, MoSPI/Central Nodal Agency,
Implementing Agency, Inspecting/Field Officer) and simply scopes each
role's view of the AI outputs.

This is intentionally a minimal stub (no real password/JWT handling wired
up yet) — replace with a proper OAuth2/JWT flow, ideally federated with
whatever identity provider eSAKSHI itself uses, before any real deployment.
"""

from __future__ import annotations

from enum import Enum

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class UserRole(str, Enum):
    mp = "MP"
    district_nodal_authority = "District Nodal Authority"
    state_nodal_authority = "State Nodal Authority"
    mospi = "MoSPI / Central Nodal Agency"
    implementing_agency = "Implementing Agency"
    inspecting_officer = "Inspecting / Field Officer"


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    role: UserRole
    display_name: str


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    """Placeholder login endpoint.

    TODO: replace with real credential verification (or SSO handoff from
    eSAKSHI) and real JWT issuance before this leaves demo/skeleton status.
    """
    return LoginResponse(
        access_token="demo-token-not-for-production",
        role=UserRole.mp,
        display_name="Shri Arjun Mehta",
    )
