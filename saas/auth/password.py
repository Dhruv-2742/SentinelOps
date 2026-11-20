"""Password hashing and verification using passlib bcrypt."""
from passlib.context import CryptContext

# pbkdf2_sha256 is built-in to python hashlib, zero external C library dependencies needed
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)
