import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
"""SentinelOps - Main FastAPI Application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from saas.api.v1.aiops import router as aiops_router
from saas.api.v1.auth import router as auth_router
from saas.api.v1.incidents import router as incidents_router

app = FastAPI(
    title="SentinelOps API",
    description="Secure AI-powered Observability Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to SentinelOps API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SentinelOps Backend"
    }


@app.get("/api/status")
def api_status():
    return {
        "application": "SentinelOps",
        "backend": "online",
        "aiops": "initializing"
    }


app.include_router(auth_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")
app.include_router(aiops_router, prefix="/api/v1")
