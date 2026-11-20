"""Database engine and session management."""
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from saas.config import config

# Ensure data directory exists
config.data_dir.mkdir(parents=True, exist_ok=True)

# For SQLite, enable check_same_thread=False
connect_args = {"check_same_thread": False} if config.database_url.startswith("sqlite") else {}

engine = create_engine(
    config.database_url,
    echo=config.debug,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables."""
    import saas.models  # Ensure all models are imported before create_all
    Base.metadata.create_all(bind=engine)
