"""Metric aggregator — accumulates 5s readings into 60s statistical summaries.

Computes:
- count
- min
- max
- mean
- p50, p95, p99 percentiles
Discards raw values upon window flush.
"""
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class MetricAggregator:
    """Aggregates raw telemetry series into statistical summary digests."""

    def __init__(self, window_seconds: int = 60):
        self.window_seconds = window_seconds
        self._buffers: Dict[str, List[float]] = defaultdict(list)
        self._metadata: Dict[str, Dict[str, Any]] = {}

    def add_reading(self, name: str, value: float, unit: str = "", labels: Optional[Dict[str, str]] = None):
        """Add a single 5s telemetry reading to the active accumulation window."""
        key = name
        self._buffers[key].append(float(value))
        if key not in self._metadata:
            self._metadata[key] = {
                "name": name,
                "unit": unit,
                "labels": labels or {},
            }

    def flush(self, collector_id: str) -> List[Dict[str, Any]]:
        """Flush the current window, compute percentiles, and clear local raw buffers."""
        now = datetime.now(timezone.utc)
        summaries = []

        for key, values in list(self._buffers.items()):
            if not values:
                continue

            sorted_vals = sorted(values)
            meta = self._metadata.get(key, {"name": key, "unit": "", "labels": {}})

            summary = {
                "collector_id": collector_id,
                "metric_name": meta["name"],
                "timestamp": now,
                "window_seconds": self.window_seconds,
                "count": len(sorted_vals),
                "min_val": sorted_vals[0],
                "max_val": sorted_vals[-1],
                "mean_val": round(statistics.mean(sorted_vals), 2),
                "p50": round(self._percentile(sorted_vals, 50), 2),
                "p95": round(self._percentile(sorted_vals, 95), 2),
                "p99": round(self._percentile(sorted_vals, 99), 2),
                "unit": meta["unit"],
                "labels": meta["labels"],
            }
            summaries.append(summary)

        # Clear active raw buffer (raw numbers are flushed and destroyed)
        self._buffers.clear()
        self._metadata.clear()
        return summaries

    @staticmethod
    def _percentile(sorted_data: List[float], pct: int) -> float:
        """Compute nearest percentile from pre-sorted float array."""
        if not sorted_data:
            return 0.0
        k = (len(sorted_data) - 1) * (pct / 100.0)
        f = int(k)
        c = f + 1
        if c >= len(sorted_data):
            return sorted_data[-1]
        return sorted_data[f] + (k - f) * (sorted_data[c] - sorted_data[f])
