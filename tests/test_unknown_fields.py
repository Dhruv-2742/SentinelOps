"""Test that extra unapproved fields are rejected by the schema gate."""
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from shared.schemas import (
    ApprovedPayload,
    CollectorHeartbeat,
    HealthIndicator,
    MetricSummary,
)


class TestUnknownFieldRejection:
    """Per spec: The ingestion endpoint and schemas must reject unknown fields."""

    def test_metric_summary_rejects_extra_fields(self):
        now = datetime.now(timezone.utc)
        with pytest.raises(ValidationError) as exc:
            MetricSummary(
                collector_id="col_1",
                metric_name="cpu",
                timestamp=now,
                count=1,
                min_val=1.0,
                max_val=1.0,
                mean_val=1.0,
                p50=1.0,
                p95=1.0,
                p99=1.0,
                raw_log_payload="SELECT * FROM users WHERE pass='123'",  # UNAPPROVED EXTRA FIELD
            )
        assert "extra" in str(exc.value).lower() or "not permitted" in str(exc.value).lower()

    def test_approved_payload_rejects_extra_fields(self):
        now = datetime.now(timezone.utc)
        with pytest.raises(ValidationError) as exc:
            ApprovedPayload(
                collector_id="col_1",
                tenant_id="org_1",
                timestamp=now,
                hmac_signature="sig",
                unapproved_raw_dump={"secret": "value"},  # EXTRA FIELD
            )
        assert "extra" in str(exc.value).lower() or "not permitted" in str(exc.value).lower()
