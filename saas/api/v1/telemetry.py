"""Telemetry querying APIs for metrics, health, and services."""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from saas.auth.middleware import get_current_org
from saas.database.engine import get_db
from saas.models.metric_summary import HealthIndicatorRecord, MetricSummaryRecord
from saas.models.service import ServiceRecord
from saas.models.user import Organization

router = APIRouter()


@router.get("/telemetry/metrics")
def get_metrics(
    name: Optional[str] = Query(None, description="Metric name filter"),
    hours: int = Query(1, ge=1, le=168, description="Time window in hours (1, 6, 24)"),
    collector_id: Optional[str] = None,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Retrieve aggregated metric summaries for the authenticated organization."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(MetricSummaryRecord).filter(
        MetricSummaryRecord.org_id == org.id,
        MetricSummaryRecord.timestamp >= cutoff,
    )
    if name:
        query = query.filter(MetricSummaryRecord.metric_name.like(f"%{name}%"))
    if collector_id:
        query = query.filter(MetricSummaryRecord.collector_id == collector_id)

    records = query.order_by(MetricSummaryRecord.timestamp.asc()).limit(1000).all()

    return [
        {
            "id": r.id,
            "collector_id": r.collector_id,
            "metric_name": r.metric_name,
            "timestamp": r.timestamp.isoformat(),
            "count": r.count,
            "min": r.min_val,
            "max": r.max_val,
            "mean": r.mean_val,
            "p50": r.p50,
            "p95": r.p95,
            "p99": r.p99,
            "unit": r.unit,
        }
        for r in records
    ]


@router.get("/telemetry/health")
def get_health(
    hours: int = Query(1, ge=1, le=168),
    collector_id: Optional[str] = None,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Retrieve health indicators (CPU %, memory %, disk %, error rate)."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(HealthIndicatorRecord).filter(
        HealthIndicatorRecord.org_id == org.id,
        HealthIndicatorRecord.timestamp >= cutoff,
    )
    if collector_id:
        query = query.filter(HealthIndicatorRecord.collector_id == collector_id)

    records = query.order_by(HealthIndicatorRecord.timestamp.asc()).limit(500).all()

    return [
        {
            "id": r.id,
            "collector_id": r.collector_id,
            "source": r.source,
            "status": r.status,
            "cpu_percent": r.cpu_percent,
            "memory_percent": r.memory_percent,
            "disk_percent": r.disk_percent,
            "error_rate": r.error_rate,
            "uptime_seconds": r.uptime_seconds,
            "timestamp": r.timestamp.isoformat(),
        }
        for r in records
    ]


@router.get("/telemetry/services")
def get_services(
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Retrieve all monitored microservices and health statuses."""
    services = db.query(ServiceRecord).filter(ServiceRecord.org_id == org.id).all()
    return [
        {
            "id": s.id,
            "service_name": s.service_name,
            "status": s.status,
            "response_time_ms": s.response_time_ms,
            "collector_id": s.collector_id,
            "timestamp": s.timestamp.isoformat(),
        }
        for s in services
    ]


@router.get("/telemetry/services/distribution")
def get_service_distribution(
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Return health breakdown counts (healthy, degraded, down)."""
    services = db.query(ServiceRecord).filter(ServiceRecord.org_id == org.id).all()
    counts = {"healthy": 0, "degraded": 0, "down": 0}
    for s in services:
        status_key = s.status.lower()
        if status_key in counts:
            counts[status_key] += 1
        else:
            counts["degraded"] += 1
    return {
        "total": len(services),
        "distribution": [
            {"name": "Healthy", "value": counts["healthy"], "color": "#10b981"},
            {"name": "Degraded", "value": counts["degraded"], "color": "#f59e0b"},
            {"name": "Down", "value": counts["down"], "color": "#ef4444"},
        ],
    }
