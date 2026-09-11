"""
Authentication & role management.

Real JWT-based login, registration, and token refresh endpoints.
Re-uses the eSAKSHI stakeholder roles (MP, District/State Nodal Authority,
MoSPI, Implementing Agency, Inspecting/Field Officer) and scopes each
role's view of the AI outputs.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse, UserCreate, UserOut, UserRole

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Authenticate a user and return a JWT access token."""
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return LoginResponse(
        access_token=token,
        role=UserRole(user.role.value),
        display_name=user.display_name,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    """Return the profile of the currently authenticated user."""
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        role=UserRole(current_user.role.value),
        display_name=current_user.display_name,
        constituency_id=current_user.constituency_id,
        is_active=current_user.is_active,
    )


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("Admin"))],
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    """Create a new user account (admin only)."""
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role.value,
        display_name=payload.display_name,
        constituency_id=payload.constituency_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(
        id=user.id,
        username=user.username,
        role=UserRole(user.role.value),
        display_name=user.display_name,
        constituency_id=user.constituency_id,
        is_active=user.is_active,
    )


@router.post("/refresh", response_model=LoginResponse)
def refresh_token(current_user: User = Depends(get_current_user)) -> LoginResponse:
    """Refresh an expiring token by issuing a new one."""
    token = create_access_token(
        data={"sub": current_user.username, "role": current_user.role.value}
    )
    return LoginResponse(
        access_token=token,
        role=UserRole(current_user.role.value),
        display_name=current_user.display_name,
    )
