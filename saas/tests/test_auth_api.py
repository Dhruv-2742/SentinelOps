"""Unit tests for SaaS auth, user registration, and login."""
import pytest
from fastapi.testclient import TestClient
from saas.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_auth_registration_and_login(client):
    import uuid
    uniq = uuid.uuid4().hex[:6]
    email = f"user_{uniq}@sentinelops.io"
    password = "StrongPassword2026!"

    # Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "username": f"user_{uniq}",
            "password": password,
            "organization_name": f"Org {uniq}",
        },
    )
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "token" in reg_data
    assert reg_data["user"]["email"] == email

    # Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]

    # Verify /me endpoint
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email
