"""Database seeding utility for development and immediate demonstration."""
import logging
from datetime import datetime, timedelta, timezone

from saas.auth.password import hash_password
from saas.database.engine import SessionLocal
from saas.models.alert import AlertRecord, AlertRuleRecord
from saas.models.collector import CollectorRegistration
from saas.models.export_audit import ExportAuditRecord
from saas.models.incident import Incident
from saas.models.metric_summary import HealthIndicatorRecord, MetricSummaryRecord
from saas.models.service import ServiceRecord
from saas.models.user import Membership, Organization, User

logger = logging.getLogger(__name__)


def utcnow():
    return datetime.now(timezone.utc)


def seed_database():
    """Populate initial organization, admin user, alert rules, and sample historical metrics."""
    db = SessionLocal()
    try:
        # 1. Organization
        org = db.query(Organization).filter(Organization.slug == "sentinelops-corp").first()
        if not org:
            org = Organization(
                id=1,
                name="SentinelOps Corp",
                slug="sentinelops-corp",
                api_key="sntl_live_demo_key_77a92b3c4d5e6f",
                hmac_secret="dev-hmac-secret",
                is_active=True,
            )
            db.add(org)
            db.flush()
            logger.info("Seeded primary organization: %s", org.name)

        # 2. Admin User
        admin_user = db.query(User).filter(User.email == "admin@sentinelops.io").first()
        if not admin_user:
            admin_user = User(
                id=1,
                email="admin@sentinelops.io",
                username="admin",
                hashed_password=hash_password("SentinelAdmin2026!"),
                full_name="Operations Lead",
                role="owner",
                is_active=True,
            )
            db.add(admin_user)
            db.flush()

            # Membership
            membership = Membership(
                user_id=admin_user.id,
                org_id=org.id,
                role="owner",
            )
            db.add(membership)
            logger.info("Seeded default admin user: %s (Password: SentinelAdmin2026!)", admin_user.email)

        # 3. Default Collector
        collector = db.query(CollectorRegistration).filter(CollectorRegistration.id == "collector-primary").first()
        if not collector:
            collector = CollectorRegistration(
                id="collector-primary",
                org_id=org.id,
                name="Production Kubernetes Node 01",
                hostname="prod-node-01.internal",
                os_info="Linux 6.8.0-cloud",
                version="0.1.0",
                status="online",
                collection_interval=5,
                last_heartbeat=utcnow(),
            )
            db.add(collector)

        # 4. Monitored Services
        services_data = [
            ("api-gateway", "healthy", 24.5),
            ("auth-service", "healthy", 18.2),
            ("telemetry-processor", "healthy", 35.0),
            ("payment-worker", "healthy", 45.1),
            ("reporting-engine", "degraded", 210.0),
        ]
        for name, status, lat in services_data:
            svc = db.query(ServiceRecord).filter(
                ServiceRecord.org_id == org.id, ServiceRecord.service_name == name
            ).first()
            if not svc:
                db.add(
                    ServiceRecord(
                        org_id=org.id,
                        collector_id="collector-primary",
                        service_name=name,
                        status=status,
                        response_time_ms=lat,
                        timestamp=utcnow(),
                    )
                )

        # 5. Default Alert Rules
        default_rules = [
            ("High CPU Utilization", "system.cpu.usage_percent", "gt", 85.0, "critical", "CPU exceeded 85%"),
            ("High Memory Pressure", "system.memory.usage_percent", "gt", 85.0, "warning", "Memory exceeded 85%"),
            ("Disk Capacity Critical", "system.disk.usage_percent", "gt", 90.0, "critical", "Disk usage above 90%"),
            ("Elevated Error Rate", "system.error_rate", "gt", 5.0, "critical", "Error rate exceeded 5% threshold"),
        ]
        for r_name, m_name, op, thresh, sev, desc in default_rules:
            existing = db.query(AlertRuleRecord).filter(
                AlertRuleRecord.org_id == org.id, AlertRuleRecord.name == r_name
            ).first()
            if not existing:
                db.add(
                    AlertRuleRecord(
                        org_id=org.id,
                        name=r_name,
                        metric_name=m_name,
                        operator=op,
                        threshold=thresh,
                        severity=sev,
                        description=desc,
                    )
                )

        # 6. Sample Initial Telemetry History (last 24 hours of 10-minute buckets)
        has_metrics = db.query(MetricSummaryRecord).filter(MetricSummaryRecord.org_id == org.id).first()
        if not has_metrics:
            now = utcnow()
            for i in range(144, 0, -1):
                ts = now - timedelta(minutes=i * 10)
                # Normal variation
                import math
                sin_val = math.sin(i / 10.0)
                cpu = max(15.0, min(80.0, 35.0 + sin_val * 15.0 + (i % 5)))
                mem = max(40.0, min(75.0, 55.0 + sin_val * 8.0))
                disk = 52.0 + (144 - i) * 0.05

                for m_name, val, unit in [
                    ("system.cpu.usage_percent", cpu, "percent"),
                    ("system.memory.usage_percent", mem, "percent"),
                    ("system.disk.usage_percent", disk, "percent"),
                ]:
                    db.add(
                        MetricSummaryRecord(
                            collector_id="collector-primary",
                            org_id=org.id,
                            metric_name=m_name,
                            timestamp=ts,
                            window_seconds=600,
                            count=120,
                            min_val=max(0.0, val - 8.0),
                            max_val=min(100.0, val + 12.0),
                            mean_val=val,
                            p50=val - 1.0,
                            p95=val + 8.0,
                            p99=val + 11.0,
                            unit=unit,
                            labels_json='{"host": "prod-node-01"}',
                        )
                    )

                # Health indicators
                db.add(
                    HealthIndicatorRecord(
                        collector_id="collector-primary",
                        org_id=org.id,
                        source="host",
                        status="healthy",
                        cpu_percent=cpu,
                        memory_percent=mem,
                        disk_percent=disk,
                        uptime_seconds=86400.0 + i * 600,
                        error_rate=0.8,
                        timestamp=ts,
                    )
                )

            # Sample Export Audit Record
            db.add(
                ExportAuditRecord(
                    org_id=org.id,
                    collector_id="collector-primary",
                    records_processed=17280,
                    fields_approved=138240,
                    fields_rejected=42,
                    sensitive_values_detected=18,
                    events_exported=288,
                    privacy_engine_status="active",
                    timestamp=now,
                )
            )

        db.commit()
        logger.info("Database seeding successfully completed.")
    except Exception as e:
        db.rollback()
        logger.error("Error during database seed: %s", e)
    finally:
        db.close()
