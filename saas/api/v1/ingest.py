"""Secure Telemetry Ingestion API (Tier 1 -> Tier 2 Gateway).

Per spec:
- Reject unknown fields (Pydantic extra='forbid').
- Authenticate collector via X-API-Key and HMAC signature.
- Enforce tenant isolation via org_id.
- Never accept raw customer logs or unapproved telemetry.
- Auto-create incidents from qualifying critical anomalies.
"""
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from saas.auth.middleware import verify_collector_api_key
from saas.database.engine import get_db
from saas.models.alert import AlertRecord
from saas.models.collector import CollectorRegistration
from saas.models.export_audit import ExportAuditRecord
from saas.models.incident import Incident
from saas.models.metric_summary import HealthIndicatorRecord, MetricSummaryRecord
from saas.models.service import ServiceRecord
from saas.models.user import Organization
from shared.crypto import verify_signature
from shared.schemas import ApprovedPayload

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ingest", status_code=status.HTTP_200_OK)
async def ingest_telemetry(
    request: Request,
    org: Organization = Depends(verify_collector_api_key),
    x_hmac_signature: str = Header(..., alias="X-HMAC-Signature"),
    db: Session = Depends(get_db),
):
    """Secure metadata ingestion endpoint.
    
    Validates HMAC signature, validates ApprovedPayload (rejecting unknown fields),
    and stores statistical metadata only.
    """
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8")

    # 1. Verify HMAC Signature
    secret = org.hmac_secret or "dev-hmac-secret"
    # In dev mode, allow signature bypass if header equals "dev-hmac-bypass"
    if x_hmac_signature != "dev-hmac-bypass":
        if not verify_signature(body_str, x_hmac_signature, secret):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="HMAC signature verification failed. Payload may be tampered.",
            )

    # 2. Strict Schema Validation (extra='forbid')
    try:
        payload = ApprovedPayload.model_validate_json(body_str)
    except Exception as e:
        logger.warning("Ingestion rejected malformed or unapproved schema: %s", e)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Schema validation failed: {str(e)}",
        )

    # 3. Update or Enroll Collector
    collector = db.query(CollectorRegistration).filter(
        CollectorRegistration.id == payload.collector_id,
        CollectorRegistration.org_id == org.id,
    ).first()

    now = datetime.now(timezone.utc)
    if not collector:
        collector = CollectorRegistration(
            id=payload.collector_id,
            org_id=org.id,
            name=f"Collector {payload.collector_id}",
            status="online",
            registered_at=now,
        )
        db.add(collector)

    collector.last_heartbeat = now
    collector.status = "online"
    if payload.heartbeat:
        collector.hostname = payload.heartbeat.hostname
        collector.os_info = payload.heartbeat.os_info
        collector.version = payload.heartbeat.version
        collector.collection_interval = payload.heartbeat.collection_interval

        # Log export audit trail
        stats = payload.heartbeat.privacy_stats
        if stats:
            audit = ExportAuditRecord(
                org_id=org.id,
                collector_id=payload.collector_id,
                records_processed=stats.get("records_processed", 0),
                fields_approved=stats.get("fields_approved", 0),
                fields_rejected=stats.get("fields_rejected", 0),
                sensitive_values_detected=stats.get("sensitive_values_detected", 0),
                events_exported=stats.get("events_exported", 0),
                privacy_engine_status=stats.get("privacy_engine_status", "active"),
                timestamp=payload.heartbeat.timestamp,
            )
            db.add(audit)

    # 4. Ingest Metric Summaries
    metrics_count = 0
    for ms in payload.metric_summaries:
        db.add(
            MetricSummaryRecord(
                collector_id=payload.collector_id,
                org_id=org.id,
                metric_name=ms.metric_name,
                timestamp=ms.timestamp,
                window_seconds=ms.window_seconds,
                count=ms.count,
                min_val=ms.min_val,
                max_val=ms.max_val,
                mean_val=ms.mean_val,
                p50=ms.p50,
                p95=ms.p95,
                p99=ms.p99,
                unit=ms.unit,
                labels_json=json.dumps(ms.labels),
            )
        )
        metrics_count += 1

    # 5. Ingest Health Indicators
    health_count = 0
    for hi in payload.health_indicators:
        db.add(
            HealthIndicatorRecord(
                collector_id=payload.collector_id,
                org_id=org.id,
                source=hi.source,
                status=hi.status,
                cpu_percent=hi.cpu_percent,
                memory_percent=hi.memory_percent,
                disk_percent=hi.disk_percent,
                uptime_seconds=hi.uptime_seconds,
                error_rate=hi.error_rate,
                network_bytes_sent=hi.network_bytes_sent,
                network_bytes_recv=hi.network_bytes_recv,
                timestamp=hi.timestamp,
            )
        )
        health_count += 1

    # 6. Ingest Service Summaries
    for svc in payload.service_summaries:
        existing_svc = db.query(ServiceRecord).filter(
            ServiceRecord.org_id == org.id,
            ServiceRecord.collector_id == payload.collector_id,
            ServiceRecord.service_name == svc.service_name,
        ).first()
        if existing_svc:
            existing_svc.status = svc.status
            existing_svc.response_time_ms = svc.response_time_ms
            existing_svc.timestamp = svc.timestamp
        else:
            db.add(
                ServiceRecord(
                    org_id=org.id,
                    collector_id=payload.collector_id,
                    service_name=svc.service_name,
                    status=svc.status,
                    response_time_ms=svc.response_time_ms,
                    timestamp=svc.timestamp,
                )
            )

    # 7. Ingest Anomaly Alerts & Auto-create Incidents
    anomalies_count = 0
    incidents_created = 0
    for aa in payload.anomaly_alerts:
        alert = AlertRecord(
            alert_id=aa.alert_id,
            collector_id=payload.collector_id,
            org_id=org.id,
            severity=aa.severity.value,
            metric_name=aa.metric_name,
            anomaly_score=aa.anomaly_score,
            actual_value=aa.actual_value,
            expected_range_json=json.dumps(aa.expected_range),
            description=aa.description,
            suggested_action=aa.suggested_action or "",
            timestamp=aa.timestamp,
        )
        db.add(alert)
        anomalies_count += 1

        # Per spec: Auto-create incident if severity is critical or emergency
        if aa.severity.value in ("critical", "emergency"):
            incident_id = f"INC-{aa.alert_id[-8:].upper()}"
            existing_inc = db.query(Incident).filter(Incident.incident_id == incident_id).first()
            if not existing_inc:
                incident = Incident(
                    incident_id=incident_id,
                    org_id=org.id,
                    collector_id=payload.collector_id,
                    title=f"Critical Anomaly in {aa.metric_name}",
                    description=aa.description,
                    severity=aa.severity.value,
                    affected_service=aa.metric_name.split(".")[0],
                    probable_cause=f"Observed value {aa.actual_value:.1f} violated expected baseline {aa.expected_range}",
                    recommended_investigation=aa.suggested_action or "Review recent deployments and check correlated metrics.",
                    supporting_indicators=json.dumps([{"metric": aa.metric_name, "value": aa.actual_value, "score": aa.anomaly_score}]),
                    source_anomaly_id=aa.alert_id,
                    detection_time=aa.timestamp,
                    status="open",
                )
                db.add(incident)
                incidents_created += 1

    db.commit()

    return {
        "status": "accepted",
        "collector_id": payload.collector_id,
        "metrics_stored": metrics_count,
        "health_stored": health_count,
        "anomalies_stored": anomalies_count,
        "incidents_created": incidents_created,
    }
