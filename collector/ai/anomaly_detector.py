"""AIOps Anomaly Detector running locally inside customer environment.

Uses:
- Scikit-learn Isolation Forest on multi-dimensional temporal features:
  [value, rolling_mean_5, rolling_std_5, diff_1, diff_2]
- Outputs only anomaly signals, expected baselines, and confidence.
- Raw observation matrix NEVER leaves local environment.
"""
import logging
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Optional
import numpy as np

from shared.constants import ANOMALY_SCORE_THRESHOLD, CRITICAL_ANOMALY_THRESHOLD, SeverityLevel
from shared.schemas import AnomalyAlert

logger = logging.getLogger(__name__)


class LocalAnomalyDetector:
    """Edge-based AIOps anomaly detector using Isolation Forest."""

    def __init__(self, contamination: float = 0.02, training_window: int = 120):
        self.contamination = contamination
        self.training_window = training_window
        self._history: Dict[str, List[float]] = defaultdict(list)
        self._models: Dict[str, Any] = {}

    def ingest(self, metric_name: str, value: float):
        """Append metric value to local history buffer."""
        self._history[metric_name].append(float(value))
        # Keep maximum window
        if len(self._history[metric_name]) > self.training_window * 3:
            self._history[metric_name] = self._history[metric_name][-self.training_window:]

    def detect(self, metric_name: str, collector_id: str) -> List[AnomalyAlert]:
        """Run Isolation Forest detection against latest readings."""
        history = self._history.get(metric_name, [])
        if len(history) < 20:
            # Insufficient points to evaluate statistical baseline
            return []

        # Feature engineering
        features = self._engineer_features(history)

        # Lazy model fitting
        from sklearn.ensemble import IsolationForest

        if metric_name not in self._models or len(history) % 50 == 0:
            try:
                model = IsolationForest(
                    n_estimators=50,
                    contamination=self.contamination,
                    random_state=42,
                    n_jobs=1,
                )
                model.fit(features)
                self._models[metric_name] = model
            except Exception as e:
                logger.error("Failed to fit Isolation Forest: %s", e)
                return []

        model = self._models[metric_name]
        latest_feature = features[-1:]
        score = float(model.decision_function(latest_feature)[0])
        pred = int(model.predict(latest_feature)[0])

        alerts = []
        if pred == -1 or score < ANOMALY_SCORE_THRESHOLD:
            latest_val = history[-1]
            normal_vals = history[:-1]
            exp_min = float(np.percentile(normal_vals, 5)) if normal_vals else 0.0
            exp_max = float(np.percentile(normal_vals, 95)) if normal_vals else 100.0

            sev = SeverityLevel.CRITICAL if score < CRITICAL_ANOMALY_THRESHOLD else SeverityLevel.WARNING

            alert = AnomalyAlert(
                collector_id=collector_id,
                alert_id=f"alert_{int(datetime.now(timezone.utc).timestamp())}_{abs(hash(metric_name)) % 10000}",
                timestamp=datetime.now(timezone.utc),
                severity=sev,
                metric_name=metric_name,
                anomaly_score=round(score, 4),
                expected_range=(round(exp_min, 1), round(exp_max, 1)),
                actual_value=round(latest_val, 2),
                confidence=round(min(1.0, abs(score) * 1.5), 2),
                description=f"Isolation Forest flagged statistical outlier in {metric_name} (val: {latest_val:.1f}, score: {score:.3f})",
                suggested_action=self._recommend_action(metric_name, latest_val),
            )
            alerts.append(alert)

        return alerts

    def _engineer_features(self, values: List[float]) -> np.ndarray:
        """Construct multi-dimensional feature space from time series."""
        arr = np.array(values, dtype=np.float64)
        n = len(arr)
        feats = np.zeros((n, 5))
        feats[:, 0] = arr  # raw value

        # Rolling mean (window 5)
        for i in range(n):
            window = arr[max(0, i - 4):i + 1]
            feats[i, 1] = np.mean(window)
            feats[i, 2] = np.std(window) if len(window) > 1 else 0.0

        # Differences (velocity & acceleration)
        feats[1:, 3] = np.diff(arr)
        feats[2:, 4] = np.diff(arr, n=2)
        return feats

    @staticmethod
    def _recommend_action(metric_name: str, val: float) -> str:
        if "cpu" in metric_name and val > 80:
            return "Investigate top CPU processes locally with `top` or check runaway tasks."
        if "memory" in metric_name and val > 80:
            return "Verify heap growth or buffer accumulation. Check memory cgroup limits."
        if "disk" in metric_name and val > 85:
            return "Clear ephemeral build artifacts or rotate active log journals."
        return "Inspect local application telemetry and logs for unusual spikes."
