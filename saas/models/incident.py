"""Incident management ORM model.

Per spec:
- Statuses: Open, Acknowledged, Resolved.
- Generated automatically from qualifying anomalies or manually.
- Includes supporting indicators, probable cause, and investigation steps.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from saas.database.engine import Base


def utcnow():
    return datetime.now(timezone.utc)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(100), unique=True, nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    collector_id = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    severity = Column(String(50), default="warning")  # info, warning, critical, emergency
    affected_service = Column(String(100), default="infrastructure")
    status = Column(String(50), default="open")  # open, acknowledged, resolved
    probable_cause = Column(Text, default="")
    recommended_investigation = Column(Text, default="")
    supporting_indicators = Column(Text, default="[]")  # JSON array of correlated signals
    source_anomaly_id = Column(String(100), nullable=True)
    detection_time = Column(DateTime, default=utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)
