"""Unit tests for Telemetry Simulator modes."""
from collector.simulation.simulator import TelemetrySimulator


def test_simulator_modes():
    sim = TelemetrySimulator(mode="normal")
    metrics = sim.generate_metrics()
    assert len(metrics) >= 4
    cpu_metric = next(m for m in metrics if "cpu" in m["name"])
    assert 20.0 <= cpu_metric["value"] <= 60.0
    assert cpu_metric["labels"]["source"] == "[SIMULATED]"

    # Switch to high_cpu
    sim.set_mode("high_cpu")
    high_metrics = sim.generate_metrics()
    high_cpu = next(m for m in high_metrics if "cpu" in m["name"])
    assert high_cpu["value"] >= 80.0
