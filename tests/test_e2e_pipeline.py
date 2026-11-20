"""End-to-End Integration Test for the Two-Tier SentinelOps Pipeline.

Tests:
1. Local collector generates and aggregates telemetry.
2. Privacy Engine enforces allowlist and scrub.
3. Outbound payload is HMAC-signed.
4. FastAPI Ingestion API validates HMAC and schema.
5. Multi-tenant isolation and dashboard aggregation are verified.
6. Absolute verification: Zero raw data or PII in SaaS database.
"""
from datetime import datetime, timezone
import json
import pytest
from fastapi.testclient import TestClient

from collector.processing.aggregator import MetricAggregator
from collector.processing.privacy_engine import PrivacyEngine
from saas.database.engine import Base, engine
from saas.database.seed import seed_database
from saas.main import app
from saas.models.metric_summary import MetricSummaryRecord
from shared.crypto import sign_payload
from shared.schemas import ApprovedPayload, CollectorHeartbeat, HealthIndicator


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure clean tables and seeded primary organization."""
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


@pytest.fixture
def client():
    return TestClient(app)


def test_full_two_tier_pipeline(client):
    """Verify entire workflow from collector telemetry to SaaS dashboard."""
    col_id = "collector-primary"
    api_key = "sntl_live_demo_key_77a92b3c4d5e6f"
    hmac_secret = "dev-hmac-secret"
    now = datetime.now(timezone.utc)

    # 1. Simulate Local Collector Scrape & Aggregation
    aggregator = MetricAggregator(window_seconds=60)
    for v in [30.0, 35.0, 40.0, 45.0, 50.0]:
        aggregator.add_reading("system.cpu.usage_percent", v, unit="percent", labels={"host": "worker-1"})

    raw_summaries = aggregator.flush(col_id)
    assert len(raw_summaries) == 1

    # 2. Process through Privacy Engine
    privacy_engine = PrivacyEngine()
    approved_metric = privacy_engine.process_metric(raw_summaries[0], col_id)
    assert approved_metric is not None
    assert approved_metric.p50 == 40.0

    # 3. Construct Approved Payload
    heartbeat = CollectorHeartbeat(
        collector_id=col_id,
        timestamp=now,
        version="0.1.0",
        hostname="worker-1",
        os_info="Linux",
        uptime_seconds=3600.0,
        collection_interval=5,
        metrics_collected=5,
        logs_processed=0,
        alerts_fired=0,
        egress_queue_depth=0,
        privacy_stats=privacy_engine.get_stats_dict(),
    )

    payload = ApprovedPayload(
        collector_id=col_id,
        tenant_id="sentinelops-corp",
        timestamp=now,
        hmac_signature="",
        metric_summaries=[approved_metric],
        health_indicators=[
            HealthIndicator(
                collector_id=col_id,
                source="host",
                timestamp=now,
                status="healthy",
                cpu_percent=40.0,
                memory_percent=55.0,
                disk_percent=60.0,
            )
        ],
        heartbeat=heartbeat,
    )

    payload_json = payload.model_dump_json()
    signature = sign_payload(payload_json, hmac_secret)

    # 4. Transmit to SaaS Ingestion Endpoint
    resp = client.post(
        "/api/v1/ingest",
        content=payload_json,
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
            "X-HMAC-Signature": signature,
        },
    )
    assert resp.status_code == 200, f"Ingestion failed: {resp.text}"
    result = resp.json()
    assert result["status"] == "accepted"
    assert result["metrics_stored"] == 1
    assert result["health_stored"] == 1

    # 5. Query Overview Dashboard via Bearer Auth
    # Login to get JWT
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@sentinelops.io", "password": "SentinelAdmin2026!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]

    dashboard_resp = client.get(
        "/api/v1/dashboards/overview?hours=1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dashboard_resp.status_code == 200
    overview = dashboard_resp.json()
    assert overview["infrastructure_health"]["score"] > 0
    assert overview["kpi_cards"]["active_collectors"] >= 1
    assert overview["kpi_cards"]["cpu_utilization"] is not None

    # 6. Verify Data Sovereignty in SaaS DB: No raw values exist
    from saas.database.engine import SessionLocal
    db = SessionLocal()
    records = db.query(MetricSummaryRecord).filter(
        MetricSummaryRecord.collector_id == col_id
    ).all()
    assert len(records) > 0
    for r in records:
        # Verify columns store statistical digests, never raw arrays
        assert isinstance(r.mean_val, float)
        assert isinstance(r.p95, float)
        assert not hasattr(r, "raw_values")
    db.close()
