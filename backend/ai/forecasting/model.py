import math
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple


@dataclass
class ForecastPoint:
    day_index: int
    predicted_price: float
    lower_bound_95: float
    upper_bound_95: float


@dataclass
class ForecastModelResult:
    historical_last_price: float
    predicted_points: List[ForecastPoint]
    mape: float
    rmse: float
    trend_direction: str  # 'BULLISH', 'BEARISH', 'SIDEWAYS'
    expected_change_pct: float
    residual_std: float


class HoltLinearTrendForecaster:
    """
    Econometric Double Exponential Smoothing (Holt's Linear Trend) forecaster
    with residual variance estimation for 95% confidence intervals and
    MAPE/RMSE goodness-of-fit metrics.
    """

    def __init__(self, alpha: float = 0.35, beta: float = 0.15):
        self.alpha = alpha
        self.beta = beta
        self.level: float = 0.0
        self.trend: float = 0.0
        self.residuals: List[float] = []
        self.fitted_values: List[float] = []
        self.history: List[float] = []
        self.mape: float = 0.0
        self.rmse: float = 0.0
        self.residual_std: float = 1.0

    def fit(self, series: List[float]) -> "HoltLinearTrendForecaster":
        n = len(series)
        if n < 2:
            raise ValueError("Series must contain at least 2 data points for Holt modeling.")

        self.history = list(series)

        # Initialize level and trend
        self.level = series[0]
        self.trend = series[1] - series[0]

        self.fitted_values = [series[0]]
        self.residuals = [0.0]

        abs_pct_errors = []
        sq_errors = []

        for t in range(1, n):
            val = series[t]
            # One step ahead forecast from previous state
            pred = self.level + self.trend
            self.fitted_values.append(pred)

            err = val - pred
            self.residuals.append(err)
            if val > 0:
                abs_pct_errors.append(abs(err) / val)
            sq_errors.append(err * err)

            # Update level and trend
            last_level = self.level
            self.level = self.alpha * val + (1.0 - self.alpha) * (self.level + self.trend)
            self.trend = self.beta * (self.level - last_level) + (1.0 - self.beta) * self.trend

        # Metrics
        self.mape = (sum(abs_pct_errors) / len(abs_pct_errors) * 100.0) if abs_pct_errors else 2.5
        self.rmse = math.sqrt(sum(sq_errors) / len(sq_errors)) if sq_errors else 15.0

        dof = max(n - 2, 1)
        self.residual_std = math.sqrt(sum(e * e for e in self.residuals) / dof)

        return self

    def predict(self, horizon_days: int = 14) -> ForecastModelResult:
        last_price = self.history[-1] if self.history else 2400.0
        points: List[ForecastPoint] = []

        for h in range(1, horizon_days + 1):
            pred = self.level + (h * self.trend)

            # Horizon standard error widening
            se = self.residual_std * math.sqrt(1.0 + (h - 1) * (self.alpha ** 2))
            lower = max(pred - (1.96 * se), 0.0)
            upper = pred + (1.96 * se)

            points.append(
                ForecastPoint(
                    day_index=h,
                    predicted_price=round(pred, 2),
                    lower_bound_95=round(lower, 2),
                    upper_bound_95=round(upper, 2),
                )
            )

        final_pred = points[-1].predicted_price if points else last_price
        change_pct = round(((final_pred - last_price) / last_price) * 100.0, 2) if last_price > 0 else 0.0

        if change_pct > 1.5:
            trend_dir = "BULLISH"
        elif change_pct < -1.5:
            trend_dir = "BEARISH"
        else:
            trend_dir = "SIDEWAYS"

        return ForecastModelResult(
            historical_last_price=round(last_price, 2),
            predicted_points=points,
            mape=round(self.mape, 2),
            rmse=round(self.rmse, 2),
            trend_direction=trend_dir,
            expected_change_pct=change_pct,
            residual_std=round(self.residual_std, 2),
        )

