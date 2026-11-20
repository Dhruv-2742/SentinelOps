"""Local SQLite Database — stores raw telemetry inside customer environment.

SECURITY PRINCIPLE:
Data in this database NEVER leaves the customer host or VPC.
"""
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List


class LocalDatabase:
    """Local SQLite engine for raw metric, log, and audit storage."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._init_schema()

    def _init_schema(self):
        """Create local raw storage tables."""
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS local_raw_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT DEFAULT '',
                timestamp TEXT NOT NULL,
                labels_json TEXT DEFAULT '{}'
            );

            CREATE TABLE IF NOT EXISTS local_raw_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                level TEXT DEFAULT 'INFO',
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS local_export_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                payload_hash TEXT NOT NULL,
                metric_summaries_count INTEGER DEFAULT 0,
                health_indicators_count INTEGER DEFAULT 0,
                anomaly_alerts_count INTEGER DEFAULT 0,
                fields_approved INTEGER DEFAULT 0,
                fields_rejected INTEGER DEFAULT 0,
                sensitive_values_detected INTEGER DEFAULT 0,
                status TEXT DEFAULT 'sent',
                response_code INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_raw_metrics_ts ON local_raw_metrics(timestamp);
            CREATE INDEX IF NOT EXISTS idx_raw_logs_ts ON local_raw_logs(timestamp);
        """)
        self.conn.commit()

    def store_metric(self, name: str, value: float, unit: str, timestamp: datetime, labels: Dict[str, str] = None):
        """Store raw metric reading locally."""
        self.conn.execute(
            "INSERT INTO local_raw_metrics (name, value, unit, timestamp, labels_json) VALUES (?, ?, ?, ?, ?)",
            (name, value, unit, timestamp.isoformat(), json.dumps(labels or {})),
        )
        self.conn.commit()

    def log_audit(
        self,
        payload_hash: str,
        metrics_count: int,
        health_count: int,
        anomalies_count: int,
        privacy_stats: Dict[str, int],
        status: str,
        response_code: int = 200,
    ):
        """Record export audit trail locally."""
        now = datetime.now(timezone.utc).isoformat()
        self.conn.execute(
            """INSERT INTO local_export_audit 
               (timestamp, payload_hash, metric_summaries_count, health_indicators_count,
                anomaly_alerts_count, fields_approved, fields_rejected,
                sensitive_values_detected, status, response_code)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                now,
                payload_hash,
                metrics_count,
                health_count,
                anomalies_count,
                privacy_stats.get("fields_approved", 0),
                privacy_stats.get("fields_rejected", 0),
                privacy_stats.get("sensitive_values_detected", 0),
                status,
                response_code,
            ),
        )
        self.conn.commit()

    def cleanup(self, retention_hours: int = 168):
        """Purge data older than retention limit."""
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=retention_hours)).isoformat()
        self.conn.execute("DELETE FROM local_raw_metrics WHERE timestamp < ?", (cutoff,))
        self.conn.execute("DELETE FROM local_raw_logs WHERE timestamp < ?", (cutoff,))
        self.conn.commit()

    def close(self):
        self.conn.close()
