"""Incident lifecycle and response management API."""
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from saas.auth.middleware import get_current_org
from saas.database.engine import get_db
from saas.models.incident import Incident
from saas.models.user import Organization

router = APIRouter()


class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str = "warning"
    affected_service: Optional[str] = "infrastructure"
    probable_cause: Optional[str] = ""
    recommended_investigation: Optional[str] = ""


class IncidentStatusUpdate(BaseModel):
    status: str  # open, acknowledged, resolved


@router.post("/incidents", status_code=status.HTTP_201_CREATED)
def create_incident(
    req: IncidentCreate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Manually create an operational incident."""
    incident = Incident(
        incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
        org_id=org.id,
        title=req.title,
        description=req.description,
        severity=req.severity,
        affected_service=req.affected_service,
        probable_cause=req.probable_cause,
        recommended_investigation=req.recommended_investigation,
        status="open",
        detection_time=datetime.now(timezone.utc),
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/incidents")
def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Retrieve incidents scoped to organization with optional filtering."""
    query = db.query(Incident).filter(Incident.org_id == org.id)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if severity_filter:
        query = query.filter(Incident.severity == severity_filter)

    incidents = query.order_by(Incident.created_at.desc()).limit(100).all()
    return [
        {
            "id": inc.id,
            "incident_id": inc.incident_id,
            "title": inc.title,
            "description": inc.description,
            "severity": inc.severity,
            "affected_service": inc.affected_service,
            "status": inc.status,
            "probable_cause": inc.probable_cause,
            "recommended_investigation": inc.recommended_investigation,
            "supporting_indicators": json.loads(inc.supporting_indicators) if inc.supporting_indicators else [],
            "detection_time": inc.detection_time.isoformat(),
            "acknowledged_at": inc.acknowledged_at.isoformat() if inc.acknowledged_at else None,
            "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
        }
        for inc in incidents
    ]


@router.patch("/incidents/{incident_id}/status")
def update_status(
    incident_id: str,
    req: IncidentStatusUpdate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Transition incident status between open, acknowledged, and resolved."""
    incident = db.query(Incident).filter(
        Incident.incident_id == incident_id,
        Incident.org_id == org.id,
    ).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    new_status = req.status.lower()
    if new_status not in ("open", "acknowledged", "resolved"):
        raise HTTPException(status_code=400, detail="Invalid status. Must be open, acknowledged, or resolved.")

    incident.status = new_status
    now = datetime.now(timezone.utc)
    if new_status == "acknowledged":
        incident.acknowledged_at = now
    elif new_status == "resolved":
        incident.resolved_at = now

    db.commit()
    return {"incident_id": incident_id, "status": new_status}
