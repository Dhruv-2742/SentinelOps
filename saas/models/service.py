"""Monitored Service Status and latency model."""
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from saas.database.engine import Base


def utcnow():
    return datetime.now(timezone.utc)


class ServiceRecord(Base):
    """Monitored application/microservice health and latency."""
    __tablename__ = "monitored_services"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    collector_id = Column(String(100), nullable=False, index=True)
    service_name = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="healthy")  # healthy, degraded, down
    response_time_ms = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    updated_at = Column(DateTime, default=utcnow)
