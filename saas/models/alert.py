"""Alert records and Alert Rules ORM models."""
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text

from saas.database.engine import Base


def utcnow():
    return datetime.now(timezone.utc)


class AlertRecord(Base):
    """Triggered anomaly and threshold alerts."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(String(100), unique=True, nullable=False, index=True)
    collector_id = Column(String(100), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    severity = Column(String(50), nullable=False)  # info, warning, critical, emergency
    metric_name = Column(String(255), nullable=False)
    anomaly_score = Column(Float, default=0.0)
    actual_value = Column(Float, default=0.0)
    expected_range_json = Column(String(100), default="[0, 100]")
    description = Column(Text, default="")
    suggested_action = Column(Text, default="")
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow)


class AlertRuleRecord(Base):
    """User-configured threshold alert rules."""
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    metric_name = Column(String(255), nullable=False)
    operator = Column(String(10), default="gt")  # gt, lt, gte, lte, eq
    threshold = Column(Float, nullable=False)
    severity = Column(String(50), default="warning")
    description = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
