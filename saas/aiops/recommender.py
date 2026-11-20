"""Contextual and deterministic operational recommendations engine."""
from typing import Any, Dict, List


class AIRecommender:
    """Generates deterministic remediation playbooks based on telemetry signatures.
    
    Per spec: Deterministic recommendations first. Core functionality must work
    without an LLM API key.
    """

    REMEDIATION_RULES = {
        "high_cpu": {
            "title": "CPU Overload Mitigation",
            "condition": lambda metrics: metrics.get("cpu_percent", 0) > 85.0,
            "actions": [
                "Verify thread pool sizes and inspect application concurrency settings.",
                "Review recent software deployments for unoptimized loops or heavy serialization.",
                "Scale out additional worker nodes behind the load balancer.",
                "Check for rogue or zombie processes consuming unthrottled compute cycles.",
            ],
        },
        "high_memory": {
            "title": "Memory Pressure Remediation",
            "condition": lambda metrics: metrics.get("memory_percent", 0) > 85.0,
            "actions": [
                "Execute garbage collection diagnostic or inspect heap memory distribution.",
                "Verify cache TTL configurations to ensure memory is properly reclaimed.",
                "Increase container cgroup limits or provision larger node memory instances.",
                "Investigate potential memory leaks in active connection pools.",
            ],
        },
        "disk_pressure": {
            "title": "Storage Exhaustion Defense",
            "condition": lambda metrics: metrics.get("disk_percent", 0) > 88.0,
            "actions": [
                "Verify log rotation policies (`logrotate`) and clean compressed archives.",
                "Remove abandoned Docker containers, dangling images, and build caches.",
                "Expand filesystem volume or attach supplementary persistent block storage.",
                "Offload cold database backups and object artifacts to cloud storage.",
            ],
        },
        "high_error_rate": {
            "title": "Error Rate Suppression",
            "condition": lambda metrics: metrics.get("error_rate", 0) > 4.0,
            "actions": [
                "Inspect local service logs for database connectivity rejections or timeouts.",
                "Check downstream dependency status and third-party rate limits.",
                "Consider initiating an immediate canary rollback if errors correlate with a deploy.",
                "Verify ingress SSL certificate validity and DNS resolution latency.",
            ],
        },
    }

    def generate_recommendations(self, current_metrics: Dict[str, float]) -> List[Dict[str, Any]]:
        """Return targeted recommendations based on active health indicators."""
        recommendations = []
        for key, rule in self.REMEDIATION_RULES.items():
            if rule["condition"](current_metrics):
                recommendations.append({
                    "category": key,
                    "title": rule["title"],
                    "actions": rule["actions"],
                    "priority": "high",
                    "requires_llm": False,
                })
        return recommendations
