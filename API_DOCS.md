# 📡 SentinelOps REST API Documentation

**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Bearer JWT (`Authorization: Bearer <token>`) for User/Dashboard APIs; API Key (`X-API-Key: <key>`) + HMAC Signature (`X-HMAC-Signature: <hex>`) for Collector Ingestion.

---

## 1. Authentication & User Management

### `POST /auth/register`
Register a new user account and root organization.
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "SecurePassword123!",
  "full_name": "System Administrator",
  "organization_name": "Acme Corp"
}
```
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "full_name": "System Administrator",
    "role": "owner"
  },
  "organization": {
    "id": 1,
    "name": "Acme Corp",
    "slug": "acme-corp",
    "api_key": "sntl_live_..."
  }
}
```

### `POST /auth/login`
Authenticate an existing user.
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**: Returns JWT bearer token and user profile.

### `GET /auth/me`
Retrieve currently authenticated user and organization context.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Collector Management & Enrollment

### `POST /collectors/enroll`
Generate a single-use enrollment token for deploying a new collector.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "name": "Production-Cluster-Node-01",
  "environment": "production"
}
```
- **Response (200 OK)**:
```json
{
  "collector_id": "col_a8f93e2b1c",
  "enrollment_token": "sntl_enroll_7f8a9...",
  "instructions": "docker run -e SENTINEL_COLLECTOR_ID=col_a8f93e2b1c -e SENTINEL_ENROLLMENT_TOKEN=sntl_enroll_7f8a9... sentinelops/collector:latest"
}
```

### `GET /collectors`
List all enrolled collectors for the current organization.
- **Response (200 OK)**:
```json
[
  {
    "id": "col_a8f93e2b1c",
    "hostname": "k8s-worker-node-4",
    "os_info": "Linux 6.8.0-amd64",
    "version": "0.1.0",
    "status": "online",
    "collection_interval": 5,
    "last_heartbeat": "2026-11-20T15:30:00Z",
    "uptime_seconds": 86420.5
  }
]
```

---

## 3. Telemetry Ingestion (Tier 1 → Tier 2)

### `POST /ingest`
Secure metadata ingestion endpoint. Rejects unknown fields (`extra="forbid"`).
- **Headers**:
  - `X-API-Key`: Organization API Key
  - `X-HMAC-Signature`: SHA256 HMAC of raw request body
  - `Content-Type`: `application/json`
- **Request Body (`ApprovedPayload`)**:
```json
{
  "collector_id": "col_a8f93e2b1c",
  "tenant_id": "org_default_1",
  "timestamp": "2026-11-20T15:30:00Z",
  "hmac_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "metric_summaries": [
    {
      "collector_id": "col_a8f93e2b1c",
      "metric_name": "system.cpu.usage_percent",
      "timestamp": "2026-11-20T15:30:00Z",
      "window_seconds": 60,
      "count": 12,
      "min_val": 24.5,
      "max_val": 48.2,
      "mean_val": 35.1,
      "p50": 34.0,
      "p95": 46.8,
      "p99": 48.0,
      "unit": "percent",
      "labels": { "host": "worker-01" }
    }
  ],
  "health_indicators": [
    {
      "collector_id": "col_a8f93e2b1c",
      "source": "host",
      "timestamp": "2026-11-20T15:30:00Z",
      "status": "healthy",
      "cpu_percent": 35.1,
      "memory_percent": 62.4,
      "disk_percent": 54.0,
      "uptime_seconds": 86420.0
    }
  ],
  "anomaly_alerts": [],
  "log_summaries": [],
  "service_summaries": [
    {
      "collector_id": "col_a8f93e2b1c",
      "service_name": "auth-service",
      "status": "healthy",
      "response_time_ms": 42.1,
      "timestamp": "2026-11-20T15:30:00Z"
    }
  ],
  "heartbeat": {
    "collector_id": "col_a8f93e2b1c",
    "timestamp": "2026-11-20T15:30:00Z",
    "version": "0.1.0",
    "hostname": "worker-01",
    "os_info": "Linux",
    "uptime_seconds": 86420.0,
    "collection_interval": 5,
    "metrics_collected": 14200,
    "logs_processed": 5410,
    "alerts_fired": 2,
    "egress_queue_depth": 0,
    "privacy_stats": {
      "records_processed": 14200,
      "fields_approved": 113600,
      "fields_rejected": 14,
      "sensitive_values_detected": 6
    }
  }
}
```
- **Response (200 OK)**:
```json
{
  "status": "accepted",
  "metrics_stored": 1,
  "health_stored": 1,
  "anomalies_stored": 0,
  "incidents_created": 0
}
```

---

## 4. Telemetry & Analytics APIs

### `GET /telemetry/metrics`
Query aggregated metric summaries.
- **Query Params**:
  - `name`: Filter by metric name (e.g., `system.cpu.usage_percent`)
  - `hours`: Time window (`1`, `6`, or `24`, default `1`)
  - `collector_id`: Optional filter

### `GET /telemetry/health`
Retrieve infrastructure health indicators across all reporting collectors.

### `GET /telemetry/services`
Retrieve status, latency, and health distribution across monitored services.

---

## 5. AIOps Intelligence APIs

### `GET /aiops/anomalies`
Retrieve detected anomalies with Isolation Forest scores, confidence metrics, and baseline bounds.

### `GET /aiops/rca`
Run correlation-based Root Cause Analysis on current incident clusters.
- **Response (200 OK)**:
```json
[
  {
    "trigger_metric": "system.cpu.usage_percent",
    "correlated_anomalies": ["system.latency_ms", "system.memory.usage_percent"],
    "probable_cause": "CPU saturation causing memory pressure and increased latency",
    "recommendation": "Scale horizontally or optimize CPU-intensive hot paths",
    "confidence_level": "probable",
    "evidence_count": 3
  }
]
```

### `GET /aiops/predictions`
Retrieve predictive capacity trend analysis (e.g., disk exhaustion forecasts).

### `GET /aiops/recommendations`
Contextual, deterministic operational recommendations for active alerts.

---

## 6. Incident & Alert Management

### `GET /incidents`
List active and resolved incidents.
- **Query Params**: `status` (`open`, `acknowledged`, `resolved`), `severity`

### `PATCH /incidents/{incident_id}/status`
Update incident status lifecycle.
- **Request Body**: `{ "status": "acknowledged" }` or `{ "status": "resolved" }`

### `GET /alerts`
List triggered threshold and anomaly alerts.

### `POST /alerts/{alert_id}/acknowledge`
Mark alert as acknowledged.

---

## 7. Data Governance & Privacy Audit

### `GET /governance/audit`
Retrieve export audit history showing exact verification records.

### `GET /governance/privacy-stats`
Aggregated privacy statistics:
```json
{
  "records_processed_locally": 142050,
  "fields_approved": 1136400,
  "fields_rejected": 312,
  "sensitive_values_detected": 84,
  "events_exported": 2841,
  "privacy_engine_status": "active",
  "policy_enforcement": "fail-closed"
}
```
