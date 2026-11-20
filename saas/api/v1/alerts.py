"""Alert rules and notification acknowledge API."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from saas.auth.middleware import get_current_org
from saas.database.engine import get_db
from saas.models.alert import AlertRecord, AlertRuleRecord
from saas.models.user import Organization

router = APIRouter()


class AlertRuleCreate(BaseModel):
    name: str
    metric_name: str
    operator: str = "gt"
    threshold: float
    severity: str = "warning"
    description: Optional[str] = ""


@router.get("/alerts")
def list_alerts(
    acknowledged: Optional[bool] = None,
    severity: Optional[str] = None,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """List fired alerts for current organization."""
    query = db.query(AlertRecord).filter(AlertRecord.org_id == org.id)
    if acknowledged is not None:
        query = query.filter(AlertRecord.acknowledged == acknowledged)
    if severity:
        query = query.filter(AlertRecord.severity == severity)

    alerts = query.order_by(AlertRecord.timestamp.desc()).limit(150).all()
    return [
        {
            "id": a.id,
            "alert_id": a.alert_id,
            "collector_id": a.collector_id,
            "metric_name": a.metric_name,
            "severity": a.severity,
            "anomaly_score": a.anomaly_score,
            "actual_value": a.actual_value,
            "description": a.description,
            "suggested_action": a.suggested_action,
            "acknowledged": a.acknowledged,
            "timestamp": a.timestamp.isoformat(),
        }
        for a in alerts
    ]


@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: str,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Mark an alert as acknowledged by an operator."""
    alert = db.query(AlertRecord).filter(
        AlertRecord.alert_id == alert_id,
        AlertRecord.org_id == org.id,
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.acknowledged = True
    alert.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    return {"alert_id": alert_id, "acknowledged": True}


@router.get("/alerts/rules")
def list_rules(
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """List configured alert rules."""
    rules = db.query(AlertRuleRecord).filter(AlertRuleRecord.org_id == org.id).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "metric_name": r.metric_name,
            "operator": r.operator,
            "threshold": r.threshold,
            "severity": r.severity,
            "description": r.description,
            "is_active": r.is_active,
        }
        for r in rules
    ]


@router.post("/alerts/rules", status_code=status.HTTP_201_CREATED)
def create_rule(
    req: AlertRuleCreate,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Create a new threshold alert rule."""
    rule = AlertRuleRecord(
        org_id=org.id,
        name=req.name,
        metric_name=req.metric_name,
        operator=req.operator,
        threshold=req.threshold,
        severity=req.severity,
        description=req.description,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule
