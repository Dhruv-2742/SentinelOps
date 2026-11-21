"""HTTPS Egress Sender — ships approved telemetry to the central SaaS platform.

Features:
- HMAC-SHA256 payload signing.
- Exponential backoff retry on network blips.
- Zero inbound ports required.
"""
import hashlib
import logging
import time
from typing import Tuple
import httpx

from shared.crypto import sign_payload
from shared.schemas import ApprovedPayload

logger = logging.getLogger(__name__)


class SaaSSender:
    """Outbound HTTPS transmitter with HMAC signature and retry handling."""

    def __init__(
        self,
        endpoint: str,
        api_key: str,
        hmac_secret: str,
        max_retries: int = 3,
        timeout_seconds: float = 10.0,
    ):
        self.endpoint = endpoint.rstrip("/")
        self.api_key = api_key
        self.hmac_secret = hmac_secret
        self.max_retries = max_retries
        self.timeout_seconds = timeout_seconds

    def send_payload(self, payload: ApprovedPayload) -> Tuple[bool, int, str]:
        """Sign and transmit an approved payload to the SaaS /api/v1/ingest endpoint."""
        # 1. Convert to JSON string
        payload_json = payload.model_dump_json()

        # 2. Compute cryptographic HMAC signature
        signature = sign_payload(payload_json, self.hmac_secret)

        url = f"{self.endpoint}/api/v1/ingest"
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key,
            "X-HMAC-Signature": signature,
        }

        # 3. Transmit with retry
        for attempt in range(1, self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout_seconds) as client:
                    resp = client.post(url, content=payload_json, headers=headers)
                    if resp.status_code == 200:
                        logger.info(
                            "Telemetry successfully ingested by SaaS (attempt %d): %s",
                            attempt,
                            resp.json().get("collector_id"),
                        )
                        return True, 200, "Success"
                    else:
                        logger.warning(
                            "SaaS rejected payload with HTTP %d: %s",
                            resp.status_code,
                            resp.text[:200],
                        )
            except Exception as e:
                logger.warning("Transmission attempt %d failed: %s", attempt, e)

            # Exponential backoff
            time.sleep(attempt * 1.5)

        return False, 500, "All transmission retries failed"
