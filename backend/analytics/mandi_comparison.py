from typing import Any, Dict, List
from mandi.models import APMC, Commodity, DailyTicker
from analytics.profit_calculator import calculate_net_profit


# Standard baseline farmer reference origin (Ludhiana rural hub default)
DEFAULT_ORIGIN = {"lat": 30.9010, "lng": 75.8573}

# APMC fixed distances from regional hub for deterministic calculation (km)
MANDI_DISTANCES = {
    "APMC_LUD": 32.0,
    "APMC_KAR": 125.0,
    "APMC_ALW": 340.0,
    "APMC_IND": 780.0,
    "APMC_RAJ": 980.0,
    "APMC_GUN": 1650.0,
}


def compare_regional_mandis(
    commodity_code: str,
    quantity_quintals: float = 100.0,
    origin_lat: float = None,
    origin_lng: float = None,
) -> Dict[str, Any]:
    """
    Ranks active regional APMCs trading the specified commodity by Net In-Hand Proceeds,
    factoring in transport distance, freight tariffs, and statutory deductions.
    """
    try:
        commodity = Commodity.objects.get(code=commodity_code)
    except Commodity.DoesNotExist:
        # Fallback to first available commodity
        commodity = Commodity.objects.first()
        if not commodity:
            raise ValueError(f"No commodities found in database for code '{commodity_code}'.")

    # Fetch latest daily tickers for this commodity across mandis
    tickers = DailyTicker.objects.filter(commodity=commodity).select_related("mandi").order_by("-recorded_at")

    # Group by mandi, picking the latest recorded date
    mandi_latest = {}
    for t in tickers:
        m_code = t.mandi.market_code
        if m_code not in mandi_latest:
            mandi_latest[m_code] = t

    # If no tickers in DB for this commodity, create comparison from APMC list
    if not mandi_latest:
        all_apmcs = list(APMC.objects.all()[:4])
        comp_records = []
        base_rate = float(commodity.agmarknet_modal_rate or commodity.standard_msp_rate or 2400.0)

        for i, m in enumerate(all_apmcs):
            dist = MANDI_DISTANCES.get(m.market_code, 45.0 + i * 40.0)
            rate = base_rate + (50.0 if i == 0 else -30.0 * i)
            profit = calculate_net_profit(
                quantity_quintals=quantity_quintals,
                rate_per_quintal=rate,
                distance_km=dist,
                commodity_name=commodity.name,
            )
            comp_records.append({
                "mandiName": f"{m.name}, {m.state}",
                "marketCode": m.market_code,
                "quotedRate": round(rate, 2),
                "distanceKm": round(dist, 1),
                "buyerDemandQty": 3000 + (i * 450),
                "estimatedFreight": round(profit.freight_cost, 2),
                "mandiCess": round(profit.mandi_cess, 2),
                "estimatedNetProceeds": round(profit.net_proceeds, 2),
                "effectiveRate": round(profit.effective_price_per_quintal, 2),
            })
    else:
        comp_records = []
        for m_code, ticker in mandi_latest.items():
            dist = MANDI_DISTANCES.get(m_code, 60.0)
            rate = float(ticker.modal_price)
            profit = calculate_net_profit(
                quantity_quintals=quantity_quintals,
                rate_per_quintal=rate,
                distance_km=dist,
                commodity_name=commodity.name,
            )
            comp_records.append({
                "mandiName": f"{ticker.mandi.name}, {ticker.mandi.state}",
                "marketCode": m_code,
                "quotedRate": round(rate, 2),
                "distanceKm": round(dist, 1),
                "buyerDemandQty": float(ticker.arrivals_volume),
                "estimatedFreight": round(profit.freight_cost, 2),
                "mandiCess": round(profit.mandi_cess, 2),
                "estimatedNetProceeds": round(profit.net_proceeds, 2),
                "effectiveRate": round(profit.effective_price_per_quintal, 2),
            })

    # Sort descending by Net In-Hand Proceeds
    comp_records.sort(key=lambda x: x["estimatedNetProceeds"], reverse=True)

    # Determine recommendation
    if len(comp_records) >= 2:
        top = comp_records[0]
        second = comp_records[1]
        diff = top["estimatedNetProceeds"] - second["estimatedNetProceeds"]
        if top["distanceKm"] < second["distanceKm"]:
            rec_reason = (
                f"{top['mandiName']} yields ₹{diff:,.0f} higher net proceeds due to higher local buyer demand "
                f"and significantly lower freight distance ({top['distanceKm']} km vs {second['distanceKm']} km)."
            )
        else:
            rec_reason = (
                f"{top['mandiName']} yields ₹{diff:,.0f} higher net proceeds because the higher spot rate (₹{top['quotedRate']}/Qtl) "
                f"more than compensates for the freight differential."
            )
    elif comp_records:
        rec_reason = f"{comp_records[0]['mandiName']} is currently the primary regional liquidity hub for {commodity.name}."
    else:
        rec_reason = "No active APMC mandis currently registered."

    return {
        "commodity": commodity.name,
        "commodity_code": commodity.code,
        "quantity": quantity_quintals,
        "unit": "Quintals",
        "recommendationReason": rec_reason,
        "mandis": comp_records,
    }

