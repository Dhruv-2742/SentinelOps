"""SentinelOps Local Telemetry Collector CLI.

Tagline: Observe Locally. Understand Globally.
"""
import hashlib
import logging
import platform
import socket
import sys
import time
from datetime import datetime, timezone

import click

from collector.ai.anomaly_detector import LocalAnomalyDetector
from collector.alerting.alert_engine import LocalAlertEngine
from collector.config import config
from collector.egress.approval_filter import ApprovalFilter
from collector.egress.sender import SaaSSender
from collector.ingestion.metrics_collector import MetricsCollector
from collector.ingestion.service_monitor import ServiceMonitor
from collector.processing.aggregator import MetricAggregator
from collector.processing.privacy_engine import PrivacyEngine
from collector.simulation.simulator import TelemetrySimulator
from collector.storage.local_db import LocalDatabase
from shared.constants import DEFAULT_COLLECTION_INTERVAL
from shared.schemas import ApprovedPayload, CollectorHeartbeat

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Collector] %(message)s",
)
logger = logging.getLogger("sentinel.collector")


@click.group()
@click.version_option("0.1.0")
def cli():
    """SentinelOps Local Collector — Privacy-First Telemetry Engine."""
    pass


@cli.command("start")
@click.option("--collector-id", default=None, help="Unique collector ID")
@click.option("--saas-endpoint", default=None, help="SaaS Cloud URL (default: http://localhost:8000)")
@click.option("--api-key", default=None, help="Organization API key")
@click.option("--interval", default=5, type=int, help="Collection interval in seconds (default: 5)")
@click.option("--simulation-mode", default="disabled", type=click.Choice([
    "disabled", "normal", "high_cpu", "high_memory", "disk_pressure", "app_degradation"
]), help="Simulation mode without real host load")
def start_collector(collector_id, saas_endpoint, api_key, interval, simulation_mode):
    """Run the local telemetry collection and privacy daemon."""
    col_id = collector_id or config.collector_id
    endpoint = saas_endpoint or config.saas_endpoint
    key = api_key or config.api_key
    poll_interval = interval or config.collection_interval

    click.echo("=" * 60)
    click.echo("🛡️  SENTINELOPS LOCAL TELEMETRY COLLECTOR")
    click.echo("   Observe Locally. Understand Globally.")
    click.echo("=" * 60)
    click.echo(f"   Collector ID:        {col_id}")
    click.echo(f"   SaaS Ingestion Target: {endpoint}")
    click.echo(f"   Collection Interval: {poll_interval}s")
    click.echo(f"   Simulation Mode:     {simulation_mode}")
    click.echo(f"   Local Raw Database:  {config.db_path}")
    click.echo(f"   Privacy Enforcement: Fail-Closed & Field Allowlisting")
    click.echo("=" * 60)

    # Initialize components
    local_db = LocalDatabase(config.db_path)
    metrics_collector = MetricsCollector()
    service_monitor = ServiceMonitor()
    simulator = TelemetrySimulator(mode=simulation_mode) if simulation_mode != "disabled" else None
    privacy_engine = PrivacyEngine()
    aggregator = MetricAggregator(window_seconds=config.aggregation_window)
    anomaly_detector = LocalAnomalyDetector(
        contamination=config.anomaly_contamination,
        training_window=config.training_window_size,
    )
    alert_engine = LocalAlertEngine(col_id)
    approval_filter = ApprovalFilter()
    sender = SaaSSender(endpoint=endpoint, api_key=key, hmac_secret=config.hmac_secret)

    start_time = time.time()
    last_egress_time = time.time()
    total_readings = 0
    total_egress = 0

    click.echo("✅ Collector daemon initialized. Starting 5s telemetry loop (Press Ctrl+C to stop)...")

    try:
        while True:
            cycle_start = time.time()
            now = datetime.now(timezone.utc)

            # 1. Scrape Telemetry
            if simulator:
                raw_metrics = simulator.generate_metrics()
            else:
                raw_metrics = metrics_collector.collect_all()

            # 2. Store Raw Data LOCALLY (Data Sovereignty) & Feed Analyzers
            for m in raw_metrics:
                local_db.store_metric(m["name"], m["value"], m.get("unit", ""), now, m.get("labels", {}))
                aggregator.add_reading(m["name"], m["value"], m.get("unit", ""), m.get("labels", {}))
                anomaly_detector.ingest(m["name"], m["value"])
                alert_engine.evaluate(m["name"], m["value"])
                total_readings += 1

            # 3. Time for Egress? (Periodic transmission of statistical digests)
            if time.time() - last_egress_time >= config.egress_interval:
                # Flush aggregation window
                raw_summaries = aggregator.flush(col_id)
                metric_summaries = []
                for s in raw_summaries:
                    approved_metric = privacy_engine.process_metric(s, col_id)
                    if approved_metric:
                        metric_summaries.append(approved_metric)

                # Collect health indicators
                health_dict = {
                    "collector_id": col_id,
                    "source": "host",
                    "timestamp": now,
                    "status": "healthy",
                    "cpu_percent": next((m["value"] for m in raw_metrics if "cpu" in m["name"]), 30.0),
                    "memory_percent": next((m["value"] for m in raw_metrics if "memory" in m["name"]), 45.0),
                    "disk_percent": next((m["value"] for m in raw_metrics if "disk" in m["name"]), 50.0),
                    "uptime_seconds": round(time.time() - start_time, 2),
                    "error_rate": next((m["value"] for m in raw_metrics if "error" in m["name"]), 0.2),
                }
                approved_health = privacy_engine.process_health(health_dict, col_id)

                # Run local Anomaly Detection
                detected_anomalies = []
                for m in raw_metrics:
                    alerts = anomaly_detector.detect(m["name"], col_id)
                    detected_anomalies.extend(alerts)

                # Probe local services
                services = service_monitor.check_services()

                # Heartbeat with Privacy Audit Stats
                heartbeat = CollectorHeartbeat(
                    collector_id=col_id,
                    timestamp=now,
                    version="0.1.0",
                    hostname=socket.gethostname(),
                    os_info=f"{platform.system()} {platform.release()}",
                    uptime_seconds=round(time.time() - start_time, 2),
                    collection_interval=poll_interval,
                    metrics_collected=total_readings,
                    logs_processed=0,
                    alerts_fired=alert_engine.alerts_fired_count,
                    egress_queue_depth=0,
                    privacy_stats=privacy_engine.get_stats_dict(),
                )

                # Construct strictly-allowlisted ApprovedPayload
                payload = ApprovedPayload(
                    collector_id=col_id,
                    tenant_id=config.tenant_id,
                    timestamp=now,
                    hmac_signature="",  # Will be signed by sender
                    metric_summaries=metric_summaries,
                    health_indicators=[approved_health] if approved_health else [],
                    anomaly_alerts=detected_anomalies,
                    service_summaries=[
                        {
                            "collector_id": col_id,
                            "service_name": s["service_name"],
                            "status": s["status"],
                            "response_time_ms": s["response_time_ms"],
                            "timestamp": s["timestamp"],
                        }
                        for s in services
                    ],
                    heartbeat=heartbeat,
                )

                # 4. Final Egress Approval Gate
                is_approved, reason = approval_filter.approve_or_reject(payload)
                if is_approved:
                    success, code, msg = sender.send_payload(payload)
                    privacy_engine.record_export(1)
                    total_egress += 1

                    # Log export audit to local SQLite
                    payload_hash = hashlib.sha256(payload.model_dump_json().encode()).hexdigest()
                    local_db.log_audit(
                        payload_hash=payload_hash,
                        metrics_count=len(metric_summaries),
                        health_count=1 if approved_health else 0,
                        anomalies_count=len(detected_anomalies),
                        privacy_stats=privacy_engine.get_stats_dict(),
                        status="success" if success else "failed",
                        response_code=code,
                    )
                    logger.info(
                        "Egress #%d transmitted: %d summaries, %d anomalies (HTTP %d)",
                        total_egress,
                        len(metric_summaries),
                        len(detected_anomalies),
                        code,
                    )
                else:
                    logger.error("Payload BLOCKED by egress approval filter: %s", reason)

                last_egress_time = time.time()

            # Sleep remainder of collection interval
            elapsed = time.time() - cycle_start
            sleep_time = max(0.1, poll_interval - elapsed)
            time.sleep(sleep_time)

    except KeyboardInterrupt:
        click.echo("\n🛑 Collector gracefully shutting down...")
    finally:
        local_db.close()
        click.echo("👋 Local collector stopped.")


if __name__ == "__main__":
    cli()
