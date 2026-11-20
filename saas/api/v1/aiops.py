"""AIOps Intelligence APIs: Anomalies, Correlation RCA, Predictions, and Recommendations."""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from saas.aiops.predictor import TrendPredictor
from saas.aiops.rca_engine import RCAEngine
from saas.aiops.recommender import AIRecommender
from saas.auth.middleware import get_current_org
from saas.database.engine import get_db
from saas.models.alert import AlertRecord
from saas.models.metric_summary import HealthIndicatorRecord, MetricSummaryRecord
from saas.models.user import Organization

router = APIRouter()
rca_engine = RCAEngine()
predictor = TrendPredictor()
recommender = AIRecommender()


@router.get("/aiops/anomalies")
def get_anomalies(
    hours: int = Query(24, ge=1, le=168),
    severity: Optional[str] = None,
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Retrieve anomaly alerts flagged by Isolation Forest or statistical rules."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(AlertRecord).filter(
        AlertRecord.org_id == org.id,
        AlertRecord.timestamp >= cutoff,
    )
    if severity:
        query = query.filter(AlertRecord.severity == severity)

    anomalies = query.order_by(AlertRecord.timestamp.desc()).limit(100).all()
    return [
        {
            "alert_id": a.alert_id,
            "collector_id": a.collector_id,
            "metric_name": a.metric_name,
            "severity": a.severity,
            "anomaly_score": a.anomaly_score,
            "actual_value": a.actual_value,
            "expected_range": a.expected_range_json,
            "description": a.description,
            "suggested_action": a.suggested_action,
            "acknowledged": a.acknowledged,
            "timestamp": a.timestamp.isoformat(),
        }
        for a in anomalies
    ]


@router.get("/aiops/rca")
def get_root_cause_analysis(
    hours: int = Query(6, ge=1, le=24),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Run correlation-based Root Cause Analysis on current anomaly clusters."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    alerts = db.query(AlertRecord).filter(
        AlertRecord.org_id == org.id,
        AlertRecord.timestamp >= cutoff,
    ).all()

    alert_dicts = [
        {"metric_name": a.metric_name, "severity": a.severity, "score": a.anomaly_score}
        for a in alerts
    ]
    return rca_engine.analyze(alert_dicts)


@router.get("/aiops/predictions")
def get_predictions(
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Return capacity trend forecasts for CPU, Memory, and Disk."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=6)
    metrics_to_predict = [
        ("system.cpu.usage_percent", 90.0),
        ("system.memory.usage_percent", 90.0),
        ("system.disk.usage_percent", 90.0),
    ]

    forecasts = []
    for metric_name, threshold in metrics_to_predict:
        records = db.query(MetricSummaryRecord).filter(
            MetricSummaryRecord.org_id == org.id,
            MetricSummaryRecord.metric_name == metric_name,
            MetricSummaryRecord.timestamp >= cutoff,
        ).order_by(MetricSummaryRecord.timestamp.asc()).all()

        values = [r.mean_val for r in records]
        timestamps = [r.timestamp for r in records]

        pred = predictor.predict_exhaustion(metric_name, values, timestamps, threshold=threshold)
        if pred:
            forecasts.append(pred)

    return forecasts


@router.get("/aiops/recommendations")
def get_recommendations(
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    """Generate deterministic recommendations based on latest telemetry health."""
    latest_health = db.query(HealthIndicatorRecord).filter(
        HealthIndicatorRecord.org_id == org.id,
    ).order_by(HealthIndicatorRecord.timestamp.desc()).first()

    metrics = {
        "cpu_percent": latest_health.cpu_percent if latest_health else 35.0,
        "memory_percent": latest_health.memory_percent if latest_health else 50.0,
        "disk_percent": latest_health.disk_percent if latest_health else 55.0,
        "error_rate": latest_health.error_rate if latest_health else 0.5,
    }

    return recommender.generate_recommendations(metrics)
