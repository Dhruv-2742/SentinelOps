"""Egress Approval Filter — final defense-in-depth gate.

SECURITY CHECK:
- Verifies that only approved fields exist in the final payload.
- Validates that no unscrubbed PII exists in any serialized attribute.
- Rejects payload if any check fails (fail-closed).
"""
import logging
from typing import Tuple

from collector.processing.pii_scrubber import PIIScrubber
from shared.schemas import ApprovedPayload

logger = logging.getLogger(__name__)


class EgressDeniedException(Exception):
    """Raised when an egress payload fails security policy verification."""
    pass


class ApprovalFilter:
    """Validates approved telemetry payload before it is transmitted to SaaS."""

    def __init__(self):
        self.scrubber = PIIScrubber()
        self.total_approved = 0
        self.total_rejected = 0

    def approve_or_reject(self, payload: ApprovedPayload) -> Tuple[bool, str]:
        """Perform deep pre-transmission audit on ApprovedPayload.
        
        Returns (is_approved, reason).
        """
        # Serialize to JSON string for full recursive pattern inspection
        serialized = payload.model_dump_json()

        # Check for any lingering PII patterns in any field
        if not self.scrubber.is_safe(serialized):
            self.total_rejected += 1
            _, detected = self.scrubber.scrub_text(serialized)
            reason = f"Egress DENIED: Unsanitized PII detected in payload ({detected})"
            logger.error(reason)
            return False, reason

        self.total_approved += 1
        return True, "Approved for egress"
