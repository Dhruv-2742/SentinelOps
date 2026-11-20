"""Cryptographic utilities for payload signing, verification, and token generation."""
import hashlib
import hmac
import secrets


def sign_payload(payload_json: str, secret_key: str) -> str:
    """Generate HMAC-SHA256 signature for payload integrity."""
    return hmac.new(
        secret_key.encode("utf-8"),
        payload_json.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_signature(payload_json: str, signature: str, secret_key: str) -> bool:
    """Verify HMAC-SHA256 signature using constant-time comparison."""
    expected = sign_payload(payload_json, secret_key)
    return hmac.compare_digest(expected, signature)


def generate_enrollment_token() -> str:
    """Generate a high-entropy single-use enrollment token.
    
    Per spec: Do not expose reusable enrollment credentials after initial creation.
    """
    return f"sntl_enroll_{secrets.token_urlsafe(36)}"


def generate_api_key(prefix: str = "sntl_live_") -> str:
    """Generate a cryptographically secure API key."""
    return f"{prefix}{secrets.token_urlsafe(32)}"
