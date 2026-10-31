from datetime import date
from typing import Any, Dict, List, Optional
from mandi.models import Commodity, DailyTicker, APMC


def load_historical_price_series(
    commodity_code: str,
    apmc_code: Optional[str] = None,
    limit_days: int = 90,
) -> Dict[str, Any]:
    """
    Retrieves chronologically sorted daily modal prices and volumes
    from DailyTicker records for econometric time-series modeling.
    """
    try:
        commodity = Commodity.objects.get(code=commodity_code)
    except Commodity.DoesNotExist:
        commodity = Commodity.objects.first()

    qs = DailyTicker.objects.filter(commodity=commodity)
    if apmc_code:
        qs = qs.filter(mandi__market_code=apmc_code)

    qs = qs.order_by("recorded_at")

    records = list(qs)
    # Deduplicate by recorded_at (taking average if multiple APMCs)
    day_map: Dict[date, List[float]] = {}
    vol_map: Dict[date, float] = {}

    for r in records:
        d = r.recorded_at
        day_map.setdefault(d, []).append(float(r.modal_price))
        vol_map[d] = vol_map.get(d, 0.0) + float(r.arrivals_volume)

    dates = sorted(day_map.keys())[-limit_days:]
    prices = [sum(day_map[d]) / len(day_map[d]) for d in dates]
    volumes = [vol_map[d] for d in dates]

    if len(prices) < 14:
        raise ValueError("At least 14 persisted DailyTicker observations are required for forecasting.")

    return {
        "commodity": commodity,
        "dates": dates,
        "prices": prices,
        "volumes": volumes,
    }
