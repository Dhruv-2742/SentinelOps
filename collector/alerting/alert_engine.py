"""Threshold and rule-based alert evaluator running locally on the collector."""
import logging
from datetime import datetime, timezone
from typing import Dict, List
import uuid

from shared.constants import SeverityLevel
from shared.schemas import AnomalyAlert

logger = logging.getLogger(__name__)


class LocalAlertEngine:
    """Evaluates deterministic threshold rules on metrics locally."""

    DEFAULT_RULES = [
        {"name": "system.cpu.usage_percent", "op": "gt", "thresh": 90.0, "sev": SeverityLevel.CRITICAL, "desc": "Local CPU utilization exceeded 90%"},
        {"name": "system.memory.usage_percent", "op": "gt", "thresh": 88.0, "sev": SeverityLevel.WARNING, "desc": "Local memory utilization exceeded 88%"},
        {"name": "system.disk.usage_percent", "op": "gt", "thresh": 92.0, "sev": SeverityLevel.CRITICAL, "desc": "Local disk storage exceeded 92%"},
    ]

    def __init__(self, collector_id: str):
        self.collector_id = collector_id
        self._history: List[AnomalyAlert] = []

    def evaluate(self, metric_name: str, value: float) -> List[AnomalyAlert]:
        """Check metric against static rule thresholds."""
        alerts = []
        for r in self.DEFAULT_RULES:
            if r["name"] == metric_name:
                matched = False
                if r["op"] == "gt" and value > r["thresh"]:
                    matched = True
                elif r["op"] == "lt" and value < r["thresh"]:
                    matched = True

                if matched:
                    alert = AnomalyAlert(
                        collector_id=self.collector_id,
                        alert_id=f"rule_{uuid.uuid4().hex[:8]}",
                        timestamp=datetime.now(timezone.utc),
                        severity=r["sev"],
                        metric_name=metric_name,
                        anomaly_score=-1.0,
                        expected_range=(0.0, r["thresh"]),
                        actual_value=round(value, 2),
                        confidence=1.0,
                        description=f"{r['desc']} (Current: {value:.1f})",
                        suggested_action=f"Threshold breach: {metric_name} {r['op']} {r['thresh']}",
                    )
                    alerts.append(alert)
                    self._history.append(alert)
        return alerts

    @property
    def alerts_fired_count(self) -> int:
        return len(self._history)
