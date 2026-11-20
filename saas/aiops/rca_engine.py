"""Correlation-based Root Cause Analysis (RCA) Engine.

Per spec:
- Correlate: CPU, Memory, Latency, Error Rates, Service Health.
- Generate probable causes based on evidence.
- Clearly distinguish hypotheses from confirmed causes.
"""
from datetime import datetime, timezone
from typing import Any, Dict, List


class RCAEngine:
    """Correlation-based root cause analysis for co-occurring infrastructure anomalies."""

    CAUSAL_RULES = [
        {
            "trigger": "system.cpu.usage_percent",
            "correlated": ["system.latency_ms", "system.memory.usage_percent"],
            "probable_cause": "CPU saturation causing request queuing, thread pool starvation, and latency degradation",
            "recommended_investigation": "Profile hot execution paths, check GC pauses, or scale compute replicas horizontally",
        },
        {
            "trigger": "system.memory.usage_percent",
            "correlated": ["system.disk.usage_percent", "system.error_rate"],
            "probable_cause": "Memory exhaustion triggering excessive virtual memory swap I/O and worker evictions",
            "recommended_investigation": "Inspect heap dumps for uncollected objects, leaks in caching layers, or tight pod cgroup limits",
        },
        {
            "trigger": "system.disk.usage_percent",
            "correlated": ["system.error_rate", "system.latency_ms"],
            "probable_cause": "Disk volume capacity threshold exceeded preventing append writes to log or database journals",
            "recommended_investigation": "Purge obsolete log files, truncate temp tables, and expand persistent volume claims",
        },
        {
            "trigger": "system.error_rate",
            "correlated": ["system.latency_ms"],
            "probable_cause": "Upstream service timeout or database connection pool depletion propagating downstream faults",
            "recommended_investigation": "Review database connection saturation, circuit breaker tripping, and third-party API dependencies",
        },
    ]

    def analyze(self, anomalies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Evaluate detected anomaly signals and identify probable root cause patterns."""
        if not anomalies:
            return []

        findings = []
        anomaly_metric_names = {a.get("metric_name") for a in anomalies}

        for rule in self.CAUSAL_RULES:
            trigger = rule["trigger"]
            if trigger in anomaly_metric_names:
                # Find matching correlated signals
                found_correlations = [m for m in rule["correlated"] if m in anomaly_metric_names]
                evidence_count = len(found_correlations) + 1

                # Clearly distinguish hypothesis from probable cause
                confidence_level = "probable" if len(found_correlations) >= 1 else "hypothesis"

                findings.append({
                    "trigger_metric": trigger,
                    "correlated_anomalies": found_correlations,
                    "probable_cause": rule["probable_cause"],
                    "recommended_investigation": rule["recommended_investigation"],
                    "confidence_level": confidence_level,
                    "evidence_count": evidence_count,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

        # If anomalies exist without a predefined rule match
        if not findings and anomalies:
            lead_anomaly = anomalies[0]
            findings.append({
                "trigger_metric": lead_anomaly.get("metric_name", "unknown"),
                "correlated_anomalies": [],
                "probable_cause": f"Isolated threshold anomaly observed in {lead_anomaly.get('metric_name')}",
                "recommended_investigation": "Compare metric against historical baselines and check recent configuration changes",
                "confidence_level": "hypothesis",
                "evidence_count": 1,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

        findings.sort(key=lambda x: x["evidence_count"], reverse=True)
        return findings
