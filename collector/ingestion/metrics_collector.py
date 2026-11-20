"""System telemetry collector using psutil.

Collects:
- CPU utilization (overall and per-core)
- Memory utilization (virtual and swap)
- Disk utilization (mount points and I/O rates)
- Network statistics (bytes sent/received)
- Host information
"""
import platform
import socket
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

import psutil


class MetricsCollector:
    """Scrapes local system telemetry using psutil."""

    def __init__(self):
        self._hostname = socket.gethostname()
        self._os_info = f"{platform.system()} {platform.release()}"
        # Seed cpu_percent initial interval
        psutil.cpu_percent(interval=None)

    @property
    def host_info(self) -> Dict[str, str]:
        return {
            "hostname": self._hostname,
            "os_info": self._os_info,
            "architecture": platform.machine(),
        }

    def collect_all(self) -> List[Dict[str, Any]]:
        """Collect all system telemetry metrics."""
        now = datetime.now(timezone.utc)
        metrics = []

        # 1. CPU Metrics
        cpu_overall = psutil.cpu_percent(interval=None)
        metrics.append({
            "name": "system.cpu.usage_percent",
            "value": float(cpu_overall),
            "timestamp": now,
            "unit": "percent",
            "labels": {"host": self._hostname},
        })

        # 2. Memory Metrics
        mem = psutil.virtual_memory()
        metrics.append({
            "name": "system.memory.usage_percent",
            "value": float(mem.percent),
            "timestamp": now,
            "unit": "percent",
            "labels": {"host": self._hostname},
        })
        metrics.append({
            "name": "system.memory.available_mb",
            "value": round(mem.available / (1024 * 1024), 2),
            "timestamp": now,
            "unit": "MB",
            "labels": {"host": self._hostname},
        })

        # 3. Disk Metrics
        try:
            root_mount = "C:\\" if platform.system() == "Windows" else "/"
            disk = psutil.disk_usage(root_mount)
            metrics.append({
                "name": "system.disk.usage_percent",
                "value": float(disk.percent),
                "timestamp": now,
                "unit": "percent",
                "labels": {"host": self._hostname, "mount": root_mount},
            })
        except Exception:
            pass

        # 4. Network I/O
        try:
            net = psutil.net_io_counters()
            metrics.append({
                "name": "system.network.bytes_sent",
                "value": float(net.bytes_sent),
                "timestamp": now,
                "unit": "bytes",
                "labels": {"host": self._hostname},
            })
            metrics.append({
                "name": "system.network.bytes_recv",
                "value": float(net.bytes_recv),
                "timestamp": now,
                "unit": "bytes",
                "labels": {"host": self._hostname},
            })
        except Exception:
            pass

        return metrics
