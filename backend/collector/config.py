"""Local Collector Configuration with Pydantic Settings."""
from pathlib import Path
from pydantic_settings import BaseSettings


class CollectorConfig(BaseSettings):
    """Configuration for the SentinelOps Local Collector."""

    # Identity
    collector_id: str = "collector-primary"
    tenant_id: str = "sentinelops-corp"

    # Cloud connection
    saas_endpoint: str = "http://localhost:8000"
    api_key: str = "sntl_live_demo_key_77a92b3c4d5e6f"
    hmac_secret: str = "dev-hmac-secret"

    # Intervals (spec demands 5s collection interval)
    collection_interval: int = 5
    aggregation_window: int = 60
    egress_interval: int = 30  # Send summaries every 30s for demo responsiveness
    health_check_interval: int = 15

    # Storage
    data_dir: Path = Path("./data/collector")
    db_path: Path = Path("./data/collector/local_sentinel.db")
    retention_hours: int = 168  # 7 days

    # Privacy Engine
    pii_scrub_enabled: bool = True
    fail_closed: bool = True

    # AIOps & ML
    anomaly_detection_enabled: bool = True
    anomaly_contamination: float = 0.02
    training_window_size: int = 120

    # Simulation Mode: disabled, normal, high_cpu, high_memory, disk_pressure, app_degradation
    simulation_mode: str = "disabled"
    simulation_label: str = "[SIMULATED]"

    # Log ingestion targets
    log_targets: list[str] = []

    model_config = {"env_prefix": "SENTINEL_"}


config = CollectorConfig()
