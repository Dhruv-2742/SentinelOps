"""Collector registration and lifecycle ORM model."""
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from saas.database.engine import Base


def utcnow():
    return datetime.now(timezone.utc)


class CollectorRegistration(Base):
    __tablename__ = "collector_registrations"

    id = Column(String(100), primary_key=True)  # collector_id
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), default="")
    hostname = Column(String(255), default="")
    os_info = Column(String(255), default="")
    version = Column(String(50), default="0.1.0")
    status = Column(String(50), default="online")  # online, degraded, offline
    collection_interval = Column(Integer, default=5)
    enrollment_token = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    last_heartbeat = Column(DateTime, nullable=True)
    registered_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="collectors")
