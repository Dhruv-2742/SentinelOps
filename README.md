# 🛡️ SentinelOps

> **Tagline:** *Observe Locally. Understand Globally.*  
> **Project Type:** Privacy-First, AI-Powered, Two-Tier SaaS Observability Platform

SentinelOps is an enterprise-grade observability platform designed to solve the critical conflict between deep system visibility and strict data privacy regulations (GDPR, HIPAA, SOC 2). By employing a **two-tier architecture**, raw telemetry, logs, queries, and PII remain isolated inside the customer's secure perimeter, while only approved, statistical metadata summaries, health metrics, and ML-detected anomaly signals are exported to the central SaaS platform.

---

## 🚀 Key Highlights

- **🔒 Zero Raw Data Egress**: Passwords, tokens, emails, IPs, SQL strings, and raw logs never leave the customer environment.
- **🛡️ Fail-Closed Privacy Engine**: Schema allowlisting strictly rejects unapproved fields; dual-layer regex scrubs sensitive values locally.
- **🧠 Edge + Cloud AIOps**:
  - Local **Isolation Forest** anomaly detection on engineered time-series features.
  - Centralized **Correlation-based Root Cause Analysis (RCA)**.
  - **Predictive Capacity Forecaster** for proactive exhaustion warnings.
  - **Deterministic AI Recommendations**.
- **⚡ Two-Tier Infrastructure**:
  - **Tier 1 (Local Collector)**: Python daemon scraping `psutil` metrics every 5 seconds, local SQLite buffer, and simulation engine.
  - **Tier 2 (SaaS Cloud)**: FastAPI multi-tenant backend + Next.js 15 enterprise dark-navy dashboard.
- **🎯 14 Dashboard Views & 6 Public Pages**: Complete suite of infrastructure monitoring, service telemetry, incident workflows, and data governance audit trails.

---

## 🏗️ Architecture at a Glance

```
Customer Environment (Local)                       SaaS Platform (Cloud)
┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
│  Host OS & Application Telemetry     │          │  FastAPI Secure Ingestion Engine     │
│                 │                    │          │  (HMAC verification & Pydantic gate) │
│                 ▼                    │          │                 │                    │
│  SentinelOps Local Collector (5s)    │          │                 ▼                    │
│  ┌────────────────────────────────┐  │          │  Multi-Tenant Database               │
│  │ • psutil Scraper & Simulator   │  │  HTTPS   │  (Metric summaries, alerts, audits)  │
│  │ • Fail-Closed Privacy Engine   │──┼─────────▶│                 │                    │
│  │ • Local Isolation Forest (ML)  │  │ (Signed  │                 ▼                    │
│  │ • 60s Statistical Aggregator   │  │ Metadata)│  AIOps Intelligence Engine           │
│  │ • Local SQLite Store (Raw)     │  │          │  (Correlation RCA & Trend Forecast)  │
│  └────────────────────────────────┘  │          │                 │                    │
└──────────────────────────────────────┘          │                 ▼                    │
                                                  │  Next.js Dark Navy SaaS Dashboard    │
                                                  └──────────────────────────────────────┘
```

---

## 📦 Directory Structure

```
SentinelOps/
├── ARCHITECTURE.md              # Detailed architecture, security & data boundary
├── API_DOCS.md                  # REST API specification
├── docker-compose.yml           # Unified multi-container deployment
├── pyproject.toml               # Python dependencies and build config
│
├── shared/                      # Shared contracts between Collector & SaaS
│   ├── schemas.py               # Pydantic models with extra="forbid"
│   ├── crypto.py                # HMAC-SHA256 signature generation & verification
│   └── constants.py             # Enums, thresholds, and simulation modes
│
├── collector/                   # Tier 1: Local Collector
│   ├── cli.py                   # Click CLI entrypoint
│   ├── config.py                # Pydantic settings with env prefix
│   ├── ingestion/               # psutil host metrics & log collection
│   ├── processing/              # Privacy engine & statistical aggregator
│   ├── ai/                      # Isolation Forest anomaly detection
│   ├── simulation/              # Real-time incident & load simulator
│   ├── storage/                 # Local SQLite database & retention
│   ├── alerting/                # Local alert rules engine
│   └── egress/                  # Approval gate, HMAC sender & audit log
│
├── saas/                        # Tier 2: SaaS Platform
│   ├── main.py                  # FastAPI application entrypoint
│   ├── config.py                # SaaS settings
│   ├── api/v1/                  # REST API endpoints (auth, ingest, dashboards)
│   ├── auth/                    # JWT tokens, bcrypt, RBAC & API keys
│   ├── models/                  # SQLAlchemy ORM models
│   ├── aiops/                   # Correlation RCA, Trend Predictor, Recommender
│   └── database/                # Engine, session factory & seed data
│
├── frontend/                    # Next.js Enterprise UI
│   ├── src/app/                 # 6 public pages + 14 dashboard routes
│   ├── src/components/          # Tailwind + Recharts widgets
│   └── src/lib/                 # API client & auth handlers
│
└── tests/                       # Comprehensive test suite
    ├── test_privacy_acceptance.py # Critical zero-PII egress verification
    ├── test_unknown_fields.py     # Schema rejection tests
    └── test_e2e_pipeline.py       # End-to-end integration
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+

### 2. Backend & Collector Setup
```bash
# Clone the repository
git clone https://github.com/your-org/sentinelops.git
cd sentinelops

# Create virtual environment & install dependencies
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

### 3. Start the SaaS Backend
```bash
uvicorn saas.main:app --reload --port 8000
# OpenAPI Docs available at: http://localhost:8000/docs
```

### 4. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
# Dashboard available at: http://localhost:3000
```

### 5. Start a Local Collector
```bash
# Real host collection:
sentinel-collector start --saas-endpoint http://localhost:8000

# Or run in simulation mode for testing:
sentinel-collector start --simulation-mode high_cpu
```

### 6. Run Test Suite
```bash
pytest -v
```

---

## 📜 License
Apache 2.0. Copyright (c) 2026 SentinelOps Contributors.
