# 🛡️ SentinelOps Architecture Specification

> **Tagline:** *Observe Locally. Understand Globally.*  
> **Project Type:** Privacy-First, AI-Powered, Two-Tier SaaS Observability Platform

---

## 1. Executive Summary & Design Principles

SentinelOps is architected around the fundamental tenet of **Data Sovereignty**. In traditional observability platforms, high-volume raw telemetry (system metrics, raw logs, tracing spans, and application profiling) is shipped directly to cloud vendors. This introduces:
1. **Severe Security & Compliance Risks**: Raw logs frequently contain Personally Identifiable Information (PII), database credentials, session tokens, JWTs, bearer authorization headers, and customer query strings.
2. **Bandwidth & Cloud Ingestion Inefficiencies**: Sending high-frequency per-second raw data over WAN inflates egress bills and processing costs.

### The SentinelOps Paradigm:
* **Observe Locally**: A lightweight, containerized local collector sits inside the customer environment. It scrapes operating system and application metrics, tails logs, performs statistical rolling aggregations, executes local Isolation Forest anomaly detection, scrubs PII, enforces a strict fail-closed allowlist, and stores raw data locally in SQLite.
* **Understand Globally**: Only cryptographically signed, schema-validated, anonymized statistical summaries (p50/p95/p99), health indicators, ML anomaly signals, and alert metadata are transmitted to the cloud-hosted SaaS platform via outbound HTTPS.

---

## 2. Two-Tier System Architecture

```mermaid
flowchart TB
    subgraph Customer_VPC["🏢 Customer Environment (Data Sovereign Perimeter)"]
        direction TB
        APPS["Applications, Microservices & Host OS"]
        
        subgraph LocalCollector["🛡️ SentinelOps Local Collector (Tier 1)"]
            direction TB
            INGEST["Telemetry Ingestion Engine<br/>• psutil Host Scraper (5s interval)<br/>• Service Health Monitor<br/>• Synthetic Simulator"]
            NORM["Normalization & Type Validator"]
            PRIVACY["Privacy Engine (Fail-Closed)<br/>• Field Allowlist Validator<br/>• Multi-pattern Regex PII Scrubber<br/>• Rejection & Audit Log"]
            LOCAL_STORE[("Local Storage<br/>(SQLite / Encrypted Buffer)<br/>⚠️ RAW DATA REMAINS HERE")]
            AGG["Metric Aggregator<br/>• 60s Statistical Windows<br/>• Min/Max/Mean/p50/p95/p99 Digits"]
            LOCAL_ML["Local AIOps Engine<br/>• Isolation Forest Anomaly Detection<br/>• Local Threshold Alerting"]
            EGRESS["Egress Gateway<br/>• HMAC-SHA256 Payload Signer<br/>• Schema-Enforcing Serializer<br/>• Retry Queue with Backoff"]
        end
        
        APPS -->|"Raw Telemetry (5s)"| INGEST
        INGEST --> NORM
        NORM --> PRIVACY
        PRIVACY -->|"Raw Unredacted Data"| LOCAL_STORE
        PRIVACY -->|"Sanitized Data"| LOCAL_ML
        LOCAL_ML --> AGG
        AGG --> EGRESS
        LOCAL_ML -->|"Anomaly Events"| EGRESS
    end
    
    subgraph SaaS_Cloud["☁️ SentinelOps Central SaaS Platform (Tier 2)"]
        direction TB
        GATEWAY["SaaS Ingestion API (FastAPI)<br/>• HMAC Signature Verification<br/>• Collector Token Authentication<br/>• Strict Schema Validation (extra=forbid)"]
        AUTH_SVC["Multi-Tenant Isolation & RBAC<br/>• Organization Row-Level Filtering<br/>• User JWT Auth"]
        SAAS_DB[("SaaS Columnar / Relational DB<br/>• Metric Summaries (NO raw data)<br/>• Incidents & Anomaly Records<br/>• Export Audit Trail")]
        
        subgraph CloudAIOps["🧠 SaaS AIOps Intelligence Engine"]
            CORR["Correlation-based Root Cause Analysis (RCA)"]
            TREND["Capacity Trend Forecaster (Linear Regression)"]
            REC["Deterministic & Guided Remediation Engine"]
        end
        
        INCIDENT_MGR["Automated Incident Lifecycle Engine<br/>• Auto-escalation from Critical Anomalies<br/>• Status: Open → Acknowledged → Resolved"]
        
        subgraph Frontend_App["🖥️ Next.js Enterprise Dashboard"]
            UI_PUBLIC["Public Marketing & Trust Center<br/>• Landing, Features, Privacy Architecture"]
            UI_DASH["Authenticated Dashboard (14 Dedicated Views)<br/>• Dark Navy Charcoal UI<br/>• 1h / 6h / 24h Real-Time Analytics"]
        end
    end
    
    EGRESS -->|"Outbound HTTPS Only (No Inbound Ports)<br/>HMAC-SHA256 Signed Metadata Summaries"| GATEWAY
    GATEWAY --> AUTH_SVC
    AUTH_SVC --> SAAS_DB
    SAAS_DB --> CloudAIOps
    CloudAIOps --> INCIDENT_MGR
    INCIDENT_MGR --> SAAS_DB
    SAAS_DB --> UI_DASH
    
    style Customer_VPC fill:#0c101d,stroke:#e94560,stroke-width:2px,color:#fff
    style SaaS_Cloud fill:#0a0e1a,stroke:#00d2ff,stroke-width:2px,color:#fff
    style LocalCollector fill:#14192b,stroke:#e94560,stroke-width:1.5px,color:#fff
    style CloudAIOps fill:#162038,stroke:#4ecca3,stroke-width:1.5px,color:#fff
    style Frontend_App fill:#111728,stroke:#00d2ff,stroke-width:1.5px,color:#fff
```

---

## 3. Data Boundary: Stays Local vs. Leaves

| Data Category | Stays Local (Tier 1 Only) | Sent to SaaS Cloud (Tier 2 Egress) |
|---|---|---|
| **System Metrics** | Raw per-second CPU core readings, exact memory byte allocations, disk sector I/O | Aggregated 60s windows: count, min, max, mean, p50, p95, p99 |
| **System Logs** | Raw log lines, stack traces, SQL error statements, unparsed text | Aggregated pattern counts, normalized signature frequencies, total error counts |
| **Sensitive Values** | Passwords, bearer tokens, API keys, email addresses, credit cards, SSNs, IPs | **STRICTLY BLOCKED & REDACTED** — fail-closed rejection |
| **Application State** | Raw payload request bodies, URL query strings, internal headers | Health status indicators (healthy, degraded, down), latency summary buckets |
| **AIOps & Alerts** | Full high-dimensional feature matrices, raw isolation scores | Anomaly alert payloads (score, severity, metric name, expected range, action) |
| **Governance** | Local execution logs, detailed field drop audit | Aggregate audit statistics (records processed, fields approved, fields dropped) |

---

## 4. Privacy Engine: Fail-Closed Allowlisting

Unlike naive regex-only approaches, SentinelOps implements **two independent layers of privacy enforcement**:

1. **Object Reconstruction from Strict Allowlist**:
   The collector never serializes internal runtime objects. Instead, it creates **new Pydantic objects** populated only with allowlisted attributes. Any unrecognized attribute in runtime memory is rejected before construction.
2. **Deep Content Sanitization**:
   All string fields, metric label keys, and label values are recursively evaluated against pre-compiled regex detectors for:
   - Email addresses (`[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+`)
   - IPv4 addresses (`\b(?:\d{1,3}\.){3}\d{1,3}\b`)
   - JWT tokens (`eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`)
   - API keys and tokens (`(?:sk|pk|api[_-]?key)[_-][A-Za-z0-9]{16,}`)
   - Credit card numbers & SSNs
   - Key name blocklists (`password`, `authorization`, `secret`, `cookie`, `session`)
3. **Audit Trail**: Every drop, redaction, or rejection is logged in the local `export_audit` SQLite database with counts transmitted for compliance verification.

---

## 5. AIOps Intelligence Engine Architecture

The AIOps intelligence is split purposefully between Edge and Cloud:

### Tier 1: Local Anomaly Detection (Isolation Forest)
- **Feature Engineering**: For each metric stream, creates rolling features: `[value, rolling_mean_5, rolling_std_5, diff_1, diff_2]`.
- **Isolation Forest**: Identifies local outliers with `contamination=0.01`. Produces decision function score $s \in [-1, 1]$.
- Scores below $-0.5$ produce Warnings; scores below $-0.8$ produce Critical alerts.

### Tier 2: SaaS Cross-Metric Root Cause Analysis (RCA)
- **Correlation Matrix**: When anomalies co-occur in the same time window, the RCA engine measures pairwise cross-correlations across CPU, Memory, Latency, Error Rate, and Service Health.
- **Hypothesis vs. Confirmed**: Clear evidentiary distinctions are assigned. A pattern with 1 supporting indicator is tagged as *Hypothesis*; patterns matching known failure modes with $\ge 2$ correlated indicators are marked *Probable Root Cause*.
- **Predictive Horizon**: Linear regression on metric velocity projects capacity exhaustion time (e.g. disk full in 4.2 hours).
- **Remediation**: Deterministic playbook actions generated based on exact indicator signatures.

---

## 6. Security & Multi-Tenancy Model

- **No Inbound Collector Ports**: The collector operates inside firewalled customer infrastructure and initiates outbound HTTPS requests only.
- **Cryptographic Authentication**:
  - Each collector is provisioned with a unique, one-time enrollment token and receives an API Key and an HMAC Secret.
  - Every outbound payload is signed with HMAC-SHA256 (`X-HMAC-Signature`).
  - SaaS verifies tenant identity and HMAC signature before passing data to the ingestion parser.
- **Tenant Isolation**: Every database table is indexed and foreign-keyed on `org_id`. Ingestion, dashboard, and analytical queries enforce row-level scoping.
- **Schema-Enforced Ingestion**: SaaS uses Pydantic with `model_config = ConfigDict(extra="forbid")`. Any payload containing unexpected fields is immediately rejected with HTTP 422.
