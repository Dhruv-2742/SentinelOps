"""Approved data schemas — the egress contract between Collector and SaaS.

SECURITY PRINCIPLE: Fail-closed, field-allowlisted.
The exporter MUST construct a new payload from this schema.
It must NEVER send arbitrary original telemetry objects.
If a field is not explicitly defined here, it is rejected via extra='forbid'.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from shared.constants import SeverityLevel


class MetricSummary(BaseModel):
    """Aggregated metric summary — no raw values, only statistical digests."""
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    metric_name: str
    timestamp: datetime
    window_seconds: int = 60
    count: int
    min_val: float
    max_val: float
    mean_val: float
    p50: float
    p95: float
    p99: float
    unit: str = ""
    labels: dict[str, str] = Field(default_factory=dict)


class HealthIndicator(BaseModel):
    """Service/host health status — boolean/percentage, never raw data."""
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    source: str
    timestamp: datetime
    status: str  # "healthy", "degraded", "down"
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None
    disk_percent: Optional[float] = None
    uptime_seconds: Optional[float] = None
    error_rate: Optional[float] = None
    network_bytes_sent: Optional[float] = None
    network_bytes_recv: Optional[float] = None


class AnomalyAlert(BaseModel):
    """ML-detected anomaly — contains scores and context, never raw data."""
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    alert_id: str
    timestamp: datetime
    severity: SeverityLevel
    metric_name: str
    anomaly_score: float
    expected_range: tuple[float, float]
    actual_value: float
    description: str
    confidence: Optional[float] = None
    suggested_action: Optional[str] = None


class LogSummary(BaseModel):
    """Log pattern summary — counts and patterns, never raw log lines."""
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    timestamp: datetime
    window_seconds: int = 300
    total_lines: int
    error_count: int
    warning_count: int
    top_patterns: list[dict[str, int]]
    novel_pattern_count: int = 0


class ServiceSummary(BaseModel):
    """Monitored application/service summary — health & latency only."""
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    service_name: str
    status: str  # "healthy", "degraded", "down"
    response_time_ms: Optional[float] = None
    timestamp: datetime


class CollectorHeartbeat(BaseModel):
    """Periodic heartbeat proving collector is alive and reporting status."""
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    timestamp: datetime
    version: str
    hostname: str
    os_info: str
    uptime_seconds: float
    collection_interval: int
    metrics_collected: int
    logs_processed: int
    alerts_fired: int
    egress_queue_depth: int
    privacy_stats: dict[str, Any] = Field(default_factory=dict)


class ApprovedPayload(BaseModel):
    """The top-level envelope sent from Collector → SaaS.
    
    THIS IS THE STRICT EGRESS CONTRACT.
    extra='forbid' ensures any unknown field is rejected at the gateway.
    """
    model_config = ConfigDict(extra="forbid")

    collector_id: str
    tenant_id: str
    timestamp: datetime
    hmac_signature: str
    metric_summaries: list[MetricSummary] = []
    health_indicators: list[HealthIndicator] = []
    anomaly_alerts: list[AnomalyAlert] = []
    log_summaries: list[LogSummary] = []
    service_summaries: list[ServiceSummary] = []
    heartbeat: Optional[CollectorHeartbeat] = None
