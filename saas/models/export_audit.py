"""Export Audit Record model for Data Governance dashboard."""
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from saas.database.engine import Base


def utcnow():
    return datetime.now(timezone.utc)


class ExportAuditRecord(Base):
    """Stores local privacy engine audit statistics transmitted with heartbeats."""
    __tablename__ = "export_audit_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    collector_id = Column(String(100), nullable=False, index=True)
    records_processed = Column(Integer, default=0)
    fields_approved = Column(Integer, default=0)
    fields_rejected = Column(Integer, default=0)
    sensitive_values_detected = Column(Integer, default=0)
    events_exported = Column(Integer, default=0)
    privacy_engine_status = Column(String(50), default="active")
    timestamp = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow)
