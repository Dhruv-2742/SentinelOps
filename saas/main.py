"""SentinelOps SaaS Platform — Main Application Entrypoint."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from saas.api.v1.aiops import router as aiops_router
from saas.api.v1.alerts import router as alerts_router
from saas.api.v1.auth import router as auth_router
from saas.api.v1.collectors import router as collectors_router
from saas.api.v1.dashboards import router as dashboards_router
from saas.api.v1.governance import router as governance_router
from saas.api.v1.incidents import router as incidents_router
from saas.api.v1.ingest import router as ingest_router
from saas.api.v1.telemetry import router as telemetry_router
from saas.database.engine import init_db
from saas.database.seed import seed_database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sentinelops.saas")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle handler."""
    logger.info("Initializing SentinelOps SaaS Platform database...")
    init_db()
    seed_database()
    logger.info("SentinelOps SaaS Platform successfully initialized.")
    yield
    logger.info("SentinelOps SaaS Platform shutting down.")


app = FastAPI(
    title="SentinelOps SaaS Platform",
    description="Privacy-First, AI-Powered, Two-Tier Observability Platform API.",
    version="0.1.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api/v1
app.include_router(auth_router, prefix="/api/v1", tags=["Authentication"])
app.include_router(collectors_router, prefix="/api/v1", tags=["Collectors"])
app.include_router(ingest_router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(telemetry_router, prefix="/api/v1", tags=["Telemetry"])
app.include_router(aiops_router, prefix="/api/v1", tags=["AIOps Intelligence"])
app.include_router(incidents_router, prefix="/api/v1", tags=["Incidents"])
app.include_router(alerts_router, prefix="/api/v1", tags=["Alerts"])
app.include_router(governance_router, prefix="/api/v1", tags=["Data Governance"])
app.include_router(dashboards_router, prefix="/api/v1", tags=["Dashboards"])


@app.get("/health")
def health_check():
    """Service health probe."""
    return {
        "status": "healthy",
        "service": "sentinelops-saas",
        "tier": "centralized-cloud-saas",
        "version": "0.1.0",
    }
