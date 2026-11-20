"""SaaS platform configuration."""
from pathlib import Path
from pydantic_settings import BaseSettings


class SaaSConfig(BaseSettings):
    """Configuration for the SentinelOps SaaS platform."""

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # Database connection string (SQLite for local MVP, PostgreSQL ready)
    database_url: str = "sqlite:///./data/saas/sentinelops.db"

    # Security & JWT
    jwt_secret: str = "sntl_super_secret_jwt_key_2026_change_in_production!"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24  # 24 hours

    # Master / fallback API key for quick bootstrap
    master_api_key: str = "dev-master-key"
    hmac_secret: str = "dev-hmac-secret"

    # Data directory
    data_dir: Path = Path("./data/saas")

    model_config = {"env_prefix": "SAAS_"}


config = SaaSConfig()
