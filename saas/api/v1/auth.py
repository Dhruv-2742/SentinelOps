"""Authentication and session management API."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from saas.auth.jwt_handler import create_access_token
from saas.auth.middleware import get_current_user
from saas.auth.password import hash_password, verify_password
from saas.database.engine import get_db
from saas.models.user import Membership, Organization, User
from shared.crypto import generate_api_key

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = ""
    organization_name: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: dict
    organization: Optional[dict] = None


@router.post("/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and create their initial organization."""
    existing_user = db.query(User).filter(
        (User.email == req.email) | (User.username == req.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists",
        )

    # 1. Create Organization
    org_name = req.organization_name.strip() or f"{req.username}'s Org"
    slug = org_name.lower().replace(" ", "-")
    org = Organization(
        name=org_name,
        slug=slug,
        api_key=generate_api_key(),
    )
    db.add(org)
    db.flush()

    # 2. Create User
    user = User(
        email=req.email,
        username=req.username,
        hashed_password=hash_password(req.password),
        full_name=req.full_name or "",
        role="owner",
    )
    db.add(user)
    db.flush()

    # 3. Create Membership
    membership = Membership(
        user_id=user.id,
        org_id=org.id,
        role="owner",
    )
    db.add(membership)
    db.commit()

    token = create_access_token(user.id, user.email, user.role, org.id)
    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
        },
        organization={
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "api_key": org.api_key,
        },
    )


@router.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning JWT and active org."""
    user = db.query(User).filter(User.email == req.email, User.is_active == True).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Get primary membership
    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    org_id = membership.org_id if membership else 1
    org = db.query(Organization).filter(Organization.id == org_id).first()

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(user.id, user.email, user.role, org_id)
    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
        },
        organization={
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "api_key": org.api_key,
        } if org else None,
    )


@router.get("/auth/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return profile of currently logged-in user and organization context."""
    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    org = db.query(Organization).filter(Organization.id == membership.org_id).first() if membership else None
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "organization": {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "api_key": org.api_key,
        } if org else None,
    }
