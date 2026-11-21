"""Privacy Engine — the most critical component.

SECURITY POLICY: Fail-Closed & Field Allowlisting.
Per spec:
- Strict field allowlisting.
- Sensitive information detection.
- Fail-closed policy: If an export field is not explicitly approved, reject it.
- Construct a NEW payload from an explicitly approved schema.
- Do NOT send arbitrary original telemetry objects.
- Maintain a local privacy audit trail.
"""
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from collector.processing.pii_scrubber import PIIScrubber
from shared.schemas import (
    ApprovedPayload,
    CollectorHeartbeat,
    HealthIndicator,
    MetricSummary,
    ServiceSummary,
)

logger = logging.getLogger(__name__)


@dataclass
class PrivacyAuditStats:
    records_processed: int = 0
    fields_approved: int = 0
    fields_rejected: int = 0
    sensitive_values_detected: int = 0
    events_exported: int = 0
    last_export: Optional[str] = None
    status: str = "active"


class PrivacyEngine:
    """Fail-closed Privacy Engine.
    
    Constructs brand new ApprovedPayload instances.
    Never passes unvetted objects across the boundary.
    """

    ALLOWED_METRIC_FIELDS = frozenset({
        "collector_id",
        "metric_name",
        "timestamp",
        "window_seconds",
        "count",
        "min_val",
        "max_val",
        "mean_val",
        "p50",
        "p95",
        "p99",
        "unit",
        "labels",
    })

    ALLOWED_HEALTH_FIELDS = frozenset({
        "collector_id",
        "source",
        "timestamp",
        "status",
        "cpu_percent",
        "memory_percent",
        "disk_percent",
        "uptime_seconds",
        "error_rate",
        "network_bytes_sent",
        "network_bytes_recv",
    })

    def __init__(self):
        self.scrubber = PIIScrubber()
        self.stats = PrivacyAuditStats()

    def process_metric(self, raw_data: Dict[str, Any], collector_id: str) -> Optional[MetricSummary]:
        """Construct an approved MetricSummary from raw aggregated data.
        
        Enforces field allowlist and inspects labels for PII.
        """
        self.stats.records_processed += 1

        # 1. Field Allowlist Check
        for k in raw_data.keys():
            if k in self.ALLOWED_METRIC_FIELDS:
                self.stats.fields_approved += 1
            else:
                self.stats.fields_rejected += 1
                logger.warning("Privacy Engine rejected unapproved field: %s", k)

        # 2. Check metric_name for PII
        metric_name = str(raw_data.get("metric_name", ""))
        if not self.scrubber.is_safe(metric_name):
            self.stats.sensitive_values_detected += 1
            return None

        # 3. Clean Labels (strip any label key/value that contains PII)
        clean_labels = {}
        raw_labels = raw_data.get("labels", {})
        if isinstance(raw_labels, dict):
            for k, v in raw_labels.items():
                k_str, v_str = str(k), str(v)
                if self.scrubber.is_safe(k_str) and self.scrubber.is_safe(v_str):
                    clean_labels[k_str] = v_str
                else:
                    self.stats.sensitive_values_detected += 1
                    logger.warning("Privacy Engine dropped label with PII: %s=%s", k_str, v_str)

        # 4. Construct brand new MetricSummary object
        try:
            return MetricSummary(
                collector_id=collector_id,
                metric_name=metric_name,
                timestamp=raw_data["timestamp"],
                window_seconds=int(raw_data.get("window_seconds", 60)),
                count=int(raw_data["count"]),
                min_val=float(raw_data["min_val"]),
                max_val=float(raw_data["max_val"]),
                mean_val=float(raw_data["mean_val"]),
                p50=float(raw_data["p50"]),
                p95=float(raw_data["p95"]),
                p99=float(raw_data["p99"]),
                unit=str(raw_data.get("unit", "")),
                labels=clean_labels,
            )
        except Exception as e:
            logger.error("Failed to construct MetricSummary: %s", e)
            return None

    def process_health(self, raw_data: Dict[str, Any], collector_id: str) -> Optional[HealthIndicator]:
        """Construct an approved HealthIndicator object."""
        self.stats.records_processed += 1

        # Field check
        for k in raw_data.keys():
            if k in self.ALLOWED_HEALTH_FIELDS:
                self.stats.fields_approved += 1
            else:
                self.stats.fields_rejected += 1

        source = str(raw_data.get("source", "host"))
        if not self.scrubber.is_safe(source):
            self.stats.sensitive_values_detected += 1
            return None

        try:
            return HealthIndicator(
                collector_id=collector_id,
                source=source,
                timestamp=raw_data.get("timestamp", datetime.now(timezone.utc)),
                status=str(raw_data.get("status", "healthy")),
                cpu_percent=raw_data.get("cpu_percent"),
                memory_percent=raw_data.get("memory_percent"),
                disk_percent=raw_data.get("disk_percent"),
                uptime_seconds=raw_data.get("uptime_seconds"),
                error_rate=raw_data.get("error_rate"),
                network_bytes_sent=raw_data.get("network_bytes_sent"),
                network_bytes_recv=raw_data.get("network_bytes_recv"),
            )
        except Exception as e:
            logger.error("Failed to construct HealthIndicator: %s", e)
            return None

    def record_export(self, count: int = 1):
        """Update export audit statistics."""
        self.stats.events_exported += count
        self.stats.last_export = datetime.now(timezone.utc).isoformat()

    def get_stats_dict(self) -> Dict[str, Any]:
        """Return audit trail dictionary for inclusion in Heartbeat."""
        return {
            "records_processed": self.stats.records_processed,
            "fields_approved": self.stats.fields_approved,
            "fields_rejected": self.stats.fields_rejected,
            "sensitive_values_detected": self.stats.sensitive_values_detected,
            "events_exported": self.stats.events_exported,
            "last_export": self.stats.last_export or "",
            "privacy_engine_status": self.stats.status,
        }
