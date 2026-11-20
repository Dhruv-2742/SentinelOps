"""Telemetry simulation mode for demonstrations without stressing host hardware.

Per spec:
- Implement normal, warning and critical simulation modes.
- Include an option to simulate infrastructure incidents without changing the actual machine workload.
- Modes: normal, high_cpu, high_memory, disk_pressure, app_degradation.
- Demo data must be clearly distinguishable from real system telemetry via [SIMULATED] labels.
"""
import random
from datetime import datetime, timezone
from typing import Any, Dict, List


class TelemetrySimulator:
    """Generates synthetic telemetry matching realistic operational incident patterns."""

    MODES = {
        "normal": {
            "cpu": (22.0, 44.0),
            "memory": (35.0, 58.0),
            "disk": (42.0, 52.0),
            "error_rate": (0.05, 0.45),
            "latency_ms": (18.0, 45.0),
        },
        "high_cpu": {
            "cpu": (88.0, 99.4),
            "memory": (45.0, 65.0),
            "disk": (45.0, 55.0),
            "error_rate": (2.1, 7.8),
            "latency_ms": (220.0, 580.0),
        },
        "high_memory": {
            "cpu": (30.0, 52.0),
            "memory": (89.0, 97.8),
            "disk": (65.0, 82.0),
            "error_rate": (3.4, 11.2),
            "latency_ms": (140.0, 390.0),
        },
        "disk_pressure": {
            "cpu": (28.0, 48.0),
            "memory": (42.0, 62.0),
            "disk": (91.5, 98.6),
            "error_rate": (6.5, 18.0),
            "latency_ms": (310.0, 850.0),
        },
        "app_degradation": {
            "cpu": (65.0, 82.0),
            "memory": (68.0, 86.0),
            "disk": (50.0, 65.0),
            "error_rate": (18.5, 42.0),
            "latency_ms": (650.0, 2400.0),
        },
    }

    def __init__(self, mode: str = "normal", label: str = "[SIMULATED]"):
        self.mode = mode if mode in self.MODES else "normal"
        self.label = label

    def set_mode(self, mode: str):
        """Dynamically switch simulation state without restart."""
        if mode in self.MODES:
            self.mode = mode
        else:
            raise ValueError(f"Unknown simulation mode: {mode}. Valid: {list(self.MODES.keys())}")

    def generate_metrics(self) -> List[Dict[str, Any]]:
        """Generate simulated metric records."""
        now = datetime.now(timezone.utc)
        ranges = self.MODES.get(self.mode, self.MODES["normal"])
        metrics = []

        for key, (low, high) in ranges.items():
            val = random.uniform(low, high)
            # Add subtle jitter
            if random.random() < 0.08:
                val = min(100.0, val * 1.15)

            name = f"system.{key}.usage_percent" if key in ("cpu", "memory", "disk") else f"system.{key}"
            unit = "percent" if "percent" in name else ("ms" if "latency" in name else "rate")

            metrics.append({
                "name": name,
                "value": round(val, 2),
                "timestamp": now,
                "unit": unit,
                "labels": {
                    "source": self.label,
                    "simulation_mode": self.mode,
                },
            })

        return metrics
