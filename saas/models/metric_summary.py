"""Metric and Health statistical summary ORM models."""
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text

from saas.database.engine import Base


def utcnow():
    return datetime.now(timezone.utc)


class MetricSummaryRecord(Base):
    """Stores statistical summaries ONLY. Never stores raw values."""
    __tablename__ = "metric_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    collector_id = Column(String(100), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    metric_name = Column(String(255), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    window_seconds = Column(Integer, default=60)
    count = Column(Integer, nullable=False)
    min_val = Column(Float, nullable=False)
    max_val = Column(Float, nullable=False)
    mean_val = Column(Float, nullable=False)
    p50 = Column(Float, nullable=False)
    p95 = Column(Float, nullable=False)
    p99 = Column(Float, nullable=False)
    unit = Column(String(50), default="")
    labels_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=utcnow)


class HealthIndicatorRecord(Base):
    """Stores host/service health indicators (percentages & booleans)."""
    __tablename__ = "health_indicators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    collector_id = Column(String(100), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    source = Column(String(100), default="host")
    status = Column(String(50), default="healthy")  # healthy, degraded, down
    cpu_percent = Column(Float, nullable=True)
    memory_percent = Column(Float, nullable=True)
    disk_percent = Column(Float, nullable=True)
    uptime_seconds = Column(Float, nullable=True)
    error_rate = Column(Float, nullable=True)
    network_bytes_sent = Column(Float, nullable=True)
    network_bytes_recv = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow)
