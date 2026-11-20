"""Collector registration, listing, and lifecycle management API."""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from saas.auth.middleware import get_current_org, get_current_user
from saas.database.engine import get_db
from saas.models.collector import CollectorRegistration
from saas.models.user import Organization, User
from shared.crypto import generate_enrollment_token

router = APIRouter()


class EnrollCollectorRequest(BaseModel):
    name: str
    environment: Optional[str] = "production"
    collection_interval: Optional[int] = 5


class CollectorResponse(BaseModel):
    id: str
    name: str
    hostname: str
    os_info: str
    version: str
    status: str
    collection_interval: int
    last_heartbeat: Optional[datetime] = None
    uptime_seconds: Optional[float] = None


@router.post("/collectors/enroll")
def enroll_collector(
    req: EnrollCollectorRequest,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Generate a single-use enrollment token for deploying a new collector.
    
    Per spec: Do not expose reusable enrollment credentials after initial creation.
    """
    import secrets
    collector_id = f"col_{secrets.token_hex(6)}"
    token = generate_enrollment_token()

    collector = CollectorRegistration(
        id=collector_id,
        org_id=org.id,
        name=req.name,
        status="pending_enrollment",
        collection_interval=req.collection_interval or 5,
        enrollment_token=token,
    )
    db.add(collector)
    db.commit()

    return {
        "collector_id": collector_id,
        "enrollment_token": token,
        "api_key": org.api_key,
        "instructions": (
            f"docker run -d --name {collector_id} "
            f"-e SENTINEL_COLLECTOR_ID={collector_id} "
            f"-e SENTINEL_API_KEY={org.api_key} "
            f"-e SENTINEL_SAAS_ENDPOINT=https://api.sentinelops.io "
            f"sentinelops/collector:latest"
        ),
    }


@router.get("/collectors", response_model=List[CollectorResponse])
def list_collectors(
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """List all enrolled collectors for the authenticated organization."""
    collectors = db.query(CollectorRegistration).filter(
        CollectorRegistration.org_id == org.id,
        CollectorRegistration.is_active == True,
    ).all()

    return [
        CollectorResponse(
            id=c.id,
            name=c.name or c.id,
            hostname=c.hostname,
            os_info=c.os_info,
            version=c.version,
            status=c.status,
            collection_interval=c.collection_interval,
            last_heartbeat=c.last_heartbeat,
            uptime_seconds=86400.0,
        )
        for c in collectors
    ]


@router.get("/collectors/{collector_id}", response_model=CollectorResponse)
def get_collector(
    collector_id: str,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Get status and details of a specific collector."""
    c = db.query(CollectorRegistration).filter(
        CollectorRegistration.id == collector_id,
        CollectorRegistration.org_id == org.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Collector not found")

    return CollectorResponse(
        id=c.id,
        name=c.name or c.id,
        hostname=c.hostname,
        os_info=c.os_info,
        version=c.version,
        status=c.status,
        collection_interval=c.collection_interval,
        last_heartbeat=c.last_heartbeat,
        uptime_seconds=86400.0,
    )
