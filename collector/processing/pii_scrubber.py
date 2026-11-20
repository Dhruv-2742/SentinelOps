"""Comprehensive PII detector and sanitizer.

Regex-based detection for:
- Email addresses
- IPv4 addresses
- Credit card numbers
- Social security numbers (SSN)
- Bearer tokens & JWTs
- API keys & passwords
"""
import re
from typing import Dict, List, Set, Tuple


class PIIScrubber:
    """Detects and redacts sensitive information from strings and dictionaries."""

    PATTERNS: Dict[str, re.Pattern] = {
        "email": re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"),
        "ipv4": re.compile(r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b"),
        "credit_card": re.compile(r"(?<![\.\d])(?:\d{4}[ -]?){3}\d{1,4}(?![\.\d])|(?<![\.\d])\d{13,16}(?![\.\d])"),
        "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
        "jwt_token": re.compile(r"\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b"),
        "api_key": re.compile(r"\b(?:sk|pk|api[_-]?key|sntl)(?:[_-][a-zA-Z0-9]+)*[_-][A-Za-z0-9]{16,}\b", re.IGNORECASE),
        "bearer_token": re.compile(r"[Bb]earer\s+[A-Za-z0-9_\-.]+"),
        "db_password": re.compile(r"://[^:]+:([^@]+)@", re.IGNORECASE),
    }

    SENSITIVE_KEYS: Set[str] = {
        "password",
        "secret",
        "token",
        "authorization",
        "cookie",
        "session_id",
        "ssn",
        "credit_card",
        "api_key",
        "private_key",
    }

    def is_safe(self, text: str) -> bool:
        """Return True if text contains no detectable sensitive patterns."""
        if not text:
            return True
        for pattern in self.PATTERNS.values():
            if pattern.search(text):
                return False
        return True

    def scrub_text(self, text: str) -> Tuple[str, List[str]]:
        """Redact sensitive patterns from text. Returns (sanitized_string, detected_types)."""
        detected = []
        cleaned = text
        for pii_type, pattern in self.PATTERNS.items():
            if pattern.search(cleaned):
                detected.append(pii_type)
                cleaned = pattern.sub(f"[REDACTED_{pii_type.upper()}]", cleaned)
        return cleaned, detected

    def scrub_dict(self, data: dict) -> Tuple[dict, int]:
        """Recursively scrub dictionaries, redacting both sensitive keys and pattern matches."""
        cleaned = {}
        redaction_count = 0
        for k, v in data.items():
            if str(k).lower() in self.SENSITIVE_KEYS:
                cleaned[k] = "[REDACTED]"
                redaction_count += 1
            elif isinstance(v, str):
                s_val, detected = self.scrub_text(v)
                cleaned[k] = s_val
                if detected:
                    redaction_count += len(detected)
            elif isinstance(v, dict):
                sub_dict, sub_count = self.scrub_dict(v)
                cleaned[k] = sub_dict
                redaction_count += sub_count
            else:
                cleaned[k] = v
        return cleaned, redaction_count
