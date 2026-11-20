"""JWT token generation and decoding."""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from saas.config import config


def create_access_token(user_id: int, email: str, role: str, org_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=config.jwt_expiration_minutes))
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "org_id": org_id,
        "exp": expire,
    }
    return jwt.encode(payload, config.jwt_secret, algorithm=config.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token. Raises JWTError if invalid or expired."""
    return jwt.decode(token, config.jwt_secret, algorithms=[config.jwt_algorithm])
