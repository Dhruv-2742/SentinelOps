"""Local microservice health and port monitor."""
import time
from datetime import datetime, timezone
from typing import Dict, List
import httpx


class ServiceMonitor:
    """Probes local services and HTTP health endpoints."""

    def __init__(self, targets: List[Dict[str, str]] = None):
        # Default monitored microservices for local infrastructure
        self.targets = targets or [
            {"name": "api-gateway", "url": "http://localhost:8000/health"},
            {"name": "auth-service", "url": "http://localhost:8000/api/v1/auth/me"},
        ]

    def check_services(self) -> List[Dict]:
        """Probe configured microservice endpoints."""
        results = []
        now = datetime.now(timezone.utc)
        for target in self.targets:
            start = time.perf_counter()
            status = "healthy"
            latency = 15.0
            try:
                # Quick non-blocking head or get
                res = httpx.get(target["url"], timeout=1.0)
                latency = (time.perf_counter() - start) * 1000.0
                if res.status_code >= 500:
                    status = "degraded"
            except Exception:
                status = "degraded"
                latency = 50.0

            results.append({
                "service_name": target["name"],
                "status": status,
                "response_time_ms": round(latency, 2),
                "timestamp": now,
            })
        return results
