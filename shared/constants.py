"""Shared constants, enums, and configuration boundaries."""
import enum


class SeverityLevel(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class IncidentStatus(str, enum.Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class CollectorStatus(str, enum.Enum):
    ONLINE = "online"
    DEGRADED = "degraded"
    OFFLINE = "offline"


# Egress categories — only these data types may leave the collector
APPROVED_EGRESS_TYPES = frozenset({
    "metric_summary",
    "health_indicator",
    "anomaly_alert",
    "log_summary",
    "service_summary",
    "heartbeat",
})

# PII categories for detection and scrubbing
PII_CATEGORIES = frozenset({
    "email",
    "ipv4",
    "credit_card",
    "ssn",
    "phone",
    "jwt_token",
    "api_key",
    "bearer_token",
    "password",
})

# Default collection interval (spec demands 5 seconds)
DEFAULT_COLLECTION_INTERVAL = 5

# Default metric aggregation window (seconds)
DEFAULT_WINDOW_SECONDS = 60

# Anomaly detection thresholds for Isolation Forest decision function
ANOMALY_SCORE_THRESHOLD = -0.5
CRITICAL_ANOMALY_THRESHOLD = -0.75

# Simulation modes supported by the collector
SIMULATION_MODES = frozenset({
    "disabled",
    "normal",
    "high_cpu",
    "high_memory",
    "disk_pressure",
    "app_degradation",
})
