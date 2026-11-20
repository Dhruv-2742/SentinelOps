"""Predictive analytics and resource exhaustion forecaster."""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import numpy as np


class TrendPredictor:
    """Calculates linear trend gradients and forecasts time-to-exhaustion for critical resources."""

    def predict_exhaustion(
        self,
        metric_name: str,
        values: List[float],
        timestamps: List[datetime],
        threshold: float = 95.0,
    ) -> Optional[Dict[str, Any]]:
        """Project future resource utilization based on linear trend velocity."""
        if len(values) < 5:
            return None

        # Convert to numpy arrays
        y = np.array(values, dtype=np.float64)
        x = np.arange(len(y), dtype=np.float64)

        # Fit 1st-degree polynomial: y = slope * x + intercept
        slope, intercept = np.polyfit(x, y, 1)

        current_val = float(y[-1])

        # If already above threshold
        if current_val >= threshold:
            return {
                "metric_name": metric_name,
                "current_value": round(current_val, 2),
                "threshold": threshold,
                "status": "critical_breached",
                "trend": "increasing" if slope > 0 else "decreasing",
                "hours_remaining": 0.0,
                "predicted_breach_time": datetime.now(timezone.utc).isoformat(),
                "recommendation": f"URGENT: {metric_name} is currently at {current_val:.1f}%, exceeding the {threshold}% threshold.",
            }

        # If metric is decreasing or flat
        if slope <= 0.001:
            return {
                "metric_name": metric_name,
                "current_value": round(current_val, 2),
                "threshold": threshold,
                "status": "stable",
                "trend": "stable" if abs(slope) <= 0.001 else "decreasing",
                "hours_remaining": None,
                "predicted_breach_time": None,
                "recommendation": f"{metric_name} is stable or trending downward. No immediate capacity risk.",
            }

        # Calculate steps remaining until threshold is reached
        steps_to_breach = (threshold - current_val) / slope
        # Assuming each step corresponds to 60-second summary interval
        seconds_remaining = steps_to_breach * 60.0
        hours_remaining = round(max(0.01, seconds_remaining / 3600.0), 2)

        predicted_time = datetime.now(timezone.utc) + timedelta(seconds=seconds_remaining)

        if hours_remaining < 2.0:
            rec = f"CRITICAL: {metric_name} projected to breach {threshold}% within {hours_remaining} hours. Immediate scaling required."
        elif hours_remaining < 12.0:
            rec = f"WARNING: {metric_name} trending toward {threshold}% in ~{hours_remaining} hours. Schedule maintenance or expansion."
        else:
            rec = f"ADVISORY: Steady growth trajectory. Projected threshold contact in ~{hours_remaining} hours."

        return {
            "metric_name": metric_name,
            "current_value": round(current_val, 2),
            "threshold": threshold,
            "status": "warning" if hours_remaining < 6.0 else "nominal",
            "trend": "increasing",
            "hours_remaining": hours_remaining,
            "predicted_breach_time": predicted_time.isoformat(),
            "recommendation": rec,
        }
