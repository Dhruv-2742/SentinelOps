"""Privacy Acceptance Test — The most important security test in SentinelOps.

Per spec:
Create a privacy acceptance test that verifies sensitive synthetic values
never appear in outbound collector payloads.
"""
from datetime import datetime, timezone
import pytest

from collector.processing.pii_scrubber import PIIScrubber
from collector.processing.privacy_engine import PrivacyEngine
from collector.egress.approval_filter import ApprovalFilter
from shared.schemas import ApprovedPayload, MetricSummary, HealthIndicator


# Exhaustive list of synthetic sensitive items that must NEVER leak
SYNTHETIC_SENSITIVE_ITEMS = [
    ("email", "john.doe.confidential@internal-corp.net"),
    ("ipv4", "192.168.10.45"),
    ("ipv4_internal", "10.240.12.8"),
    ("credit_card", "4111-2222-3333-4444"),
    ("ssn", "987-65-4321"),
    ("jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisToken"),
    ("api_key", "sk_live_99887766554433221100aabbccddeeff"),
    ("bearer", "Bearer eyJhbGciOiJIUzI1NiJ9.secretpayload.xyz"),
    ("db_password", "postgres://admin:SuperSecretP@ssw0rd!@db:5432/production"),
]


class TestPrivacyAcceptance:
    """Verifies that no sensitive value ever leaves Tier 1 in outbound payloads."""

    def test_pii_scrubber_detects_all_patterns(self):
        """Scrubber must detect and redact every synthetic pattern."""
        scrubber = PIIScrubber()
        for label, val in SYNTHETIC_SENSITIVE_ITEMS:
            raw_text = f"Log event containing {label}={val} from user."
            cleaned, detected = scrubber.scrub_text(raw_text)
            assert val not in cleaned, f"PII leak: {val} survived scrubbing!"
            assert len(detected) > 0, f"PII undetected: {val}"

    def test_privacy_engine_drops_labels_with_pii(self):
        """Privacy engine must sanitize metric labels containing PII."""
        engine = PrivacyEngine()
        now = datetime.now(timezone.utc)

        for label, val in SYNTHETIC_SENSITIVE_ITEMS:
            raw_dict = {
                "metric_name": "system.cpu.usage_percent",
                "timestamp": now,
                "count": 12,
                "min_val": 10.0,
                "max_val": 50.0,
                "mean_val": 25.0,
                "p50": 24.0,
                "p95": 48.0,
                "p99": 50.0,
                "labels": {
                    "env": "production",
                    "user_identity": val,  # Sensitive label
                },
            }

            approved = engine.process_metric(raw_dict, collector_id="col_test")
            assert approved is not None
            # The sensitive label must be dropped
            assert "user_identity" not in approved.labels
            assert val not in approved.model_dump_json()

    def test_privacy_engine_blocks_metric_name_with_pii(self):
        """If metric name itself contains an email or IP, reject entirely."""
        engine = PrivacyEngine()
        now = datetime.now(timezone.utc)

        metric = engine.process_metric({
            "metric_name": "user.login.admin@company.com",
            "timestamp": now,
            "count": 1,
            "min_val": 1.0,
            "max_val": 1.0,
            "mean_val": 1.0,
            "p50": 1.0,
            "p95": 1.0,
            "p99": 1.0,
        }, collector_id="col_test")

        assert metric is None, "Privacy engine accepted metric with PII in name!"

    def test_approval_filter_blocks_contaminated_payload(self):
        """ApprovalFilter must catch and reject payloads containing leaked PII."""
        approval = ApprovalFilter()
        now = datetime.now(timezone.utc)

        # Craft a payload with leaked sensitive string
        payload = ApprovedPayload(
            collector_id="col_test",
            tenant_id="org_test",
            timestamp=now,
            hmac_signature="sig",
            health_indicators=[
                HealthIndicator(
                    collector_id="col_test",
                    source="host: 192.168.1.100",  # Leaked IP in source
                    timestamp=now,
                    status="healthy",
                )
            ],
        )

        is_approved, reason = approval.approve_or_reject(payload)
        assert not is_approved, "ApprovalFilter allowed payload with IP in source!"
        assert "DENIED" in reason
