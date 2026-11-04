from datetime import date, timedelta
from typing import Any, Dict, Optional
from ai.forecasting.data_loader import load_historical_price_series
from ai.forecasting.model import HoltLinearTrendForecaster


def generate_price_forecast(
    commodity_code: str,
    apmc_code: Optional[str] = None,
    horizon_days: int = 14,
) -> Dict[str, Any]:
    """
    Coordinates data loading, model fitting, and advisory synthesis to generate
    evidence-backed time-series price forecasts and holding/selling recommendations.
    """
    series_data = load_historical_price_series(commodity_code, apmc_code, limit_days=90)
    commodity = series_data["commodity"]
    prices = series_data["prices"]

    forecaster = HoltLinearTrendForecaster(alpha=0.35, beta=0.15)
    forecaster.fit(prices)
    result = forecaster.predict(horizon_days=horizon_days)

    last_date = series_data["dates"][-1] if series_data["dates"] else date(2026, 10, 31)

    chart_points = []
    for pt in result.predicted_points:
        future_date = last_date + timedelta(days=pt.day_index)
        chart_points.append({
            "day": f"Day {pt.day_index} ({future_date.strftime('%b %d')})",
            "price": pt.predicted_price,
            "lower": pt.lower_bound_95,
            "upper": pt.upper_bound_95,
        })

    final_predicted = result.predicted_points[-1].predicted_price if result.predicted_points else result.historical_last_price

    # Formulate agronomic economic recommendation
    monthly_storage_cost_per_qtl = 18.0  # ₹18/qtl/month warehouse charge
    holding_cost_for_horizon = (horizon_days / 30.0) * monthly_storage_cost_per_qtl
    net_price_gain = final_predicted - result.historical_last_price

    if result.trend_direction == "BULLISH" and net_price_gain > holding_cost_for_horizon:
        recommendation = (
            f"Hold recommendation: Expected modal gain of +₹{net_price_gain:,.1f}/Qtl exceeds "
            f"the {horizon_days}-day storage cost (₹{holding_cost_for_horizon:,.1f}/Qtl). Consider staging sales."
        )
    elif result.trend_direction == "BEARISH":
        recommendation = (
            f"Liquidate recommendation: Expected downward drift (-{abs(result.expected_change_pct)}%) "
            f"suggests immediate booking to capture current cash liquidity and avoid holding depreciation."
        )
    else:
        recommendation = (
            f"Neutral recommendation: Range-bound trajectory. Sell if cash flow is required; "
            f"otherwise observe 5-level order depth before executing large volumes."
        )

    return {
        "commodity": commodity.name,
        "commodity_code": commodity.code,
        "horizon": f"{horizon_days}-Day Trajectory",
        "currentPrice": result.historical_last_price,
        "predictedPrice": final_predicted,
        "expectedChangePct": result.expected_change_pct,
        "trendDirection": result.trend_direction,
        "confidenceLower": result.predicted_points[-1].lower_bound_95 if result.predicted_points else result.historical_last_price,
        "confidenceUpper": result.predicted_points[-1].upper_bound_95 if result.predicted_points else result.historical_last_price,
        "mape": result.mape,
        "rmse": result.rmse,
        "recommendation": recommendation,
        "forecastPoints": chart_points,
        "historicalPoints": [
            {"day": observed_date.strftime("%b %d"), "price": round(price, 2)}
            for observed_date, price in zip(series_data["dates"][-14:], prices[-14:])
        ],
    }

