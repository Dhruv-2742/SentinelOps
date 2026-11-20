"""Unit tests for Incident Lifecycle Management."""
import pytest
from fastapi.testclient import TestClient
from saas.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_incident_lifecycle(client):
    # Authenticate as admin
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@sentinelops.io", "password": "SentinelAdmin2026!"},
    )
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create incident
    create_resp = client.post(
        "/api/v1/incidents",
        json={
            "title": "Database Read Replica Latency Surge",
            "description": "Replica lag exceeded 15 seconds during query spike",
            "severity": "critical",
            "affected_service": "database",
            "probable_cause": "Unindexed full table scan on audit logs",
            "recommended_investigation": "Check slow query log and terminate hanging transactions",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    inc_data = create_resp.json()
    inc_id = inc_data["incident_id"]
    assert inc_data["status"] == "open"

    # 2. List incidents
    list_resp = client.get("/api/v1/incidents?status=open", headers=headers)
    assert list_resp.status_code == 200
    assert any(i["incident_id"] == inc_id for i in list_resp.json())

    # 3. Acknowledge incident
    ack_resp = client.patch(
        f"/api/v1/incidents/{inc_id}/status",
        json={"status": "acknowledged"},
        headers=headers,
    )
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "acknowledged"

    # 4. Resolve incident
    res_resp = client.patch(
        f"/api/v1/incidents/{inc_id}/status",
        json={"status": "resolved"},
        headers=headers,
    )
    assert res_resp.status_code == 200
    assert res_resp.json()["status"] == "resolved"
