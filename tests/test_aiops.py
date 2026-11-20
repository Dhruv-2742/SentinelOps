"""Tests for RCA Engine, Predictive Analytics, and Recommender."""
from datetime import datetime, timedelta, timezone
from saas.aiops.predictor import TrendPredictor
from saas.aiops.rca_engine import RCAEngine
from saas.aiops.recommender import AIRecommender


def test_rca_engine_correlates_cpu_and_latency():
    engine = RCAEngine()
    anomalies = [
        {"metric_name": "system.cpu.usage_percent", "score": -0.8},
        {"metric_name": "system.latency_ms", "score": -0.7},
    ]
    findings = engine.analyze(anomalies)
    assert len(findings) > 0
    top = findings[0]
    assert top["trigger_metric"] == "system.cpu.usage_percent"
    assert top["confidence_level"] == "probable"
    assert "CPU saturation" in top["probable_cause"]


def test_trend_predictor_detects_exhaustion():
    predictor = TrendPredictor()
    now = datetime.now(timezone.utc)
    # Steadily rising disk from 70% to 92%
    values = [70.0 + i * 2.0 for i in range(12)]
    timestamps = [now + timedelta(minutes=i * 5) for i in range(12)]

    pred = predictor.predict_exhaustion("system.disk.usage_percent", values, timestamps, threshold=95.0)
    assert pred is not None
    assert pred["trend"] == "increasing"
    assert pred["hours_remaining"] is not None
    assert pred["hours_remaining"] > 0


def test_recommender_produces_cpu_playbook():
    rec = AIRecommender()
    metrics = {"cpu_percent": 92.0, "memory_percent": 50.0}
    actions = rec.generate_recommendations(metrics)
    assert len(actions) > 0
    assert actions[0]["category"] == "high_cpu"
    assert len(actions[0]["actions"]) >= 3
