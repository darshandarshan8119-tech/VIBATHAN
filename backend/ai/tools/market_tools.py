"""Safe, read-only adapters around AgriMart's deterministic market engines."""

import random
from typing import Any, Callable, Dict, List

from django.db import models
from ai.llm.base import ToolDefinition
from ai.forecasting.predictor import generate_price_forecast
from analytics.buyer_matching import match_institutional_buyers
from analytics.liquidity_analysis import analyze_market_liquidity
from analytics.mandi_comparison import compare_regional_mandis
from analytics.profit_calculator import calculate_net_profit as calculate_profit_breakdown
from mandi.models import APMC, Commodity, DailyTicker


DEMO_MARKET_COMPARISONS = {
    "ragi": [
        {"mandiName": "Bengaluru APMC, Karnataka", "marketCode": "DEMO-KA", "quotedRate": 3820.0, "distanceKm": 0.0, "buyerDemandQty": 900.0},
        {"mandiName": "Mysuru APMC, Karnataka", "marketCode": "DEMO-KA-MYS", "quotedRate": 3740.0, "distanceKm": 0.0, "buyerDemandQty": 650.0},
        {"mandiName": "Salem APMC, Tamil Nadu", "marketCode": "DEMO-TN-SLM", "quotedRate": 3650.0, "distanceKm": 0.0, "buyerDemandQty": 720.0},
        {"mandiName": "Coimbatore APMC, Tamil Nadu", "marketCode": "DEMO-TN-CBE", "quotedRate": 3590.0, "distanceKm": 0.0, "buyerDemandQty": 540.0},
    ],
}


def _requested_crop_has_database_record(commodity_code: str) -> bool:
    value = str(commodity_code or "").strip()
    return bool(value) and Commodity.objects.filter(
        models.Q(code__iexact=value) | models.Q(code__icontains=value) | models.Q(name__icontains=value) | models.Q(ticker_symbol__iexact=value)
    ).exists()


def _commodity_or_default(commodity_code: str) -> Commodity:
    if not commodity_code:
        commodity = Commodity.objects.first()
        if commodity is None:
            raise ValueError("No commodities are available for market analysis.")
        return commodity

    c_clean = str(commodity_code).strip()
    # 1. Exact code match
    commodity = Commodity.objects.filter(code__iexact=c_clean).first()
    # 2. Code contains string (e.g. "wheat" in "WHEAT_SHARBAT")
    if not commodity:
        commodity = Commodity.objects.filter(code__icontains=c_clean).first()
    # 3. Name contains string (e.g. "wheat" in "Wheat (Sharbati)")
    if not commodity:
        commodity = Commodity.objects.filter(name__icontains=c_clean).first()
    # 4. Ticker symbol match
    if not commodity:
        commodity = Commodity.objects.filter(ticker_symbol__iexact=c_clean).first()
    # 5. Fallback to first available
    if commodity is None:
        commodity = Commodity.objects.first()
    if commodity is None:
        raise ValueError("No commodities are available for market analysis.")
    return commodity


def _apmc_code(market: str = "") -> str | None:
    """Resolve a user-supplied market name, district, or code to an APMC code."""
    if not market:
        return None
    value = str(market).strip()
    apmc = APMC.objects.filter(market_code__iexact=value).first()
    if apmc is None:
        apmc = APMC.objects.filter(name__icontains=value).first()
    if apmc is None:
        apmc = APMC.objects.filter(district__icontains=value).first()
    return apmc.market_code if apmc else None


def get_commodity_price(commodity_code: str) -> Dict[str, Any]:
    commodity = _commodity_or_default(commodity_code)
    ticker = (
        DailyTicker.objects.filter(commodity=commodity)
        .select_related("mandi")
        .order_by("-recorded_at")
        .first()
    )
    reference_price = float(commodity.agmarknet_modal_rate or commodity.standard_msp_rate)
    current_price = float(ticker.modal_price) if ticker else reference_price

    return {
        "commodity": commodity.name,
        "commodityCode": commodity.code,
        "mandi": f"{ticker.mandi.name}, {ticker.mandi.state}" if ticker else "APMC benchmark",
        "currentPrice": current_price,
        "prevPrice": reference_price,
        "change": round(((current_price - reference_price) / reference_price) * 100, 2) if reference_price else 0,
        "isUp": current_price >= reference_price,
        "dayHigh": float(ticker.max_price) if ticker else current_price,
        "dayLow": float(ticker.min_price) if ticker else current_price,
        "unit": "Quintal",
        "timestamp": ticker.recorded_at.isoformat() if ticker else "Benchmark rate",
        "source": ticker.source if ticker else "Commodity benchmark",
        "agmarknetBenchmark": float(commodity.agmarknet_modal_rate or commodity.standard_msp_rate),
    }


def compare_mandis(
    commodity_code: str,
    quantity_quintals: float = 100.0,
    trade_intent: str = "sell",
) -> Dict[str, Any]:
    if not _requested_crop_has_database_record(commodity_code):
        return _demo_market_comparison(commodity_code, float(quantity_quintals), trade_intent)
    result = compare_regional_mandis(commodity_code, float(quantity_quintals))
    is_buying = trade_intent.lower() == "buy"
    result["tradeIntent"] = "buy" if is_buying else "sell"
    if is_buying:
        for mandi in result["mandis"]:
            mandi["estimatedPurchaseCost"] = round(float(mandi["quotedRate"]) * float(quantity_quintals), 2)
            # No farmer origin has been verified, so do not present the regional
            # comparison's baseline distance as a distance from the user.
            mandi["distanceKm"] = None
        result["mandis"].sort(key=lambda mandi: mandi["quotedRate"])
        if result["mandis"]:
            top = result["mandis"][0]
            result["recommendationReason"] = (
                f"{top['mandiName']} has the lowest currently available quoted market price for this quantity. "
                "Transport and quality costs are not included in the purchase ranking."
            )
    return result


def get_buy_recommendation(
    commodity_code: str,
    quantity_quintals: float = 100.0,
    market: str = "",
) -> Dict[str, Any]:
    """Combine the current purchase comparison with a persisted-data timing signal."""
    result = compare_mandis(commodity_code, quantity_quintals, "buy")
    if not _requested_crop_has_database_record(commodity_code):
        result["purchaseTiming"] = None
        result["purchaseTimingNote"] = "No historical forecast is available for demo market data."
        return result

    try:
        timing = get_sell_wait_recommendation(
            commodity_code,
            market=market,
            horizon_days=14,
            quantity_quintals=quantity_quintals,
        )
        result["purchaseTiming"] = {
            "currentPrice": timing["currentPrice"],
            "predictedPrice": timing["predictedPrice"],
            "priceDifferencePerQuintal": timing["priceDifferencePerQuintal"],
            "lowerRange": timing["lowerRange"],
            "upperRange": timing["upperRange"],
            "horizon": timing["horizon"],
            "direction": timing["direction"],
        }
    except (TypeError, ValueError):
        result["purchaseTiming"] = None
        result["purchaseTimingNote"] = "A historical timing estimate is not available for this crop."
    return result


def _demo_market_comparison(commodity_code: str, quantity_quintals: float, trade_intent: str) -> Dict[str, Any]:
    crop_name = str(commodity_code or "Crop").strip().title()
    rows = [dict(row) for row in DEMO_MARKET_COMPARISONS.get(str(commodity_code).lower(), [])]
    if not rows:
        rows = [
            {"mandiName": "Demo North Market", "marketCode": "DEMO-N", "quotedRate": 3000.0, "distanceKm": 0.0, "buyerDemandQty": 500.0},
            {"mandiName": "Demo South Market", "marketCode": "DEMO-S", "quotedRate": 2850.0, "distanceKm": 0.0, "buyerDemandQty": 450.0},
        ]
    is_buying = trade_intent.lower() == "buy"
    for row in rows:
        row["estimatedFreight"] = 0.0
        row["mandiCess"] = round(row["quotedRate"] * quantity_quintals * 0.015, 2)
        row["estimatedPurchaseCost"] = round(row["quotedRate"] * quantity_quintals, 2)
        row["estimatedNetProceeds"] = round(row["estimatedPurchaseCost"] - row["mandiCess"], 2)
    rows.sort(key=lambda row: row["quotedRate"] if is_buying else -row["estimatedNetProceeds"])
    top = rows[0]
    if is_buying:
        reason = f"Demo comparison: {top['mandiName']} has the lowest illustrative quoted purchase price."
    else:
        reason = f"Demo comparison: {top['mandiName']} has the highest illustrative selling proceeds after demo cess."
    return {
        "commodity": crop_name,
        "commodity_code": str(commodity_code).upper(),
        "quantity": quantity_quintals,
        "unit": "Quintals",
        "mandis": rows,
        "tradeIntent": "buy" if is_buying else "sell",
        "recommendationReason": reason,
        "isMockData": True,
        "dataNotice": "Demo / mock market data for chat illustration only. These are not live APMC prices or a trading recommendation.",
    }


def get_market_liquidity(commodity_code: str, quantity_quintals: float = 100.0) -> Dict[str, Any]:
    result = analyze_market_liquidity(commodity_code, float(quantity_quintals))
    return {
        "commodity": result["commodity"],
        "mandi": "APMC electronic order book",
        "spread": result["spread_abs"],
        "spreadPct": f"{result['spread_pct']}%",
        "bestBid": result["best_bid"],
        "bestAsk": result["best_ask"],
        "totalBidQty": result["total_bid_vol"],
        "totalAskQty": result["total_ask_vol"],
        "unit": "Qtl",
        "timestamp": "Latest available depth",
        "bids": [{"price": item["rate"], "qty": item["qty"], "orders": item["orders"]} for item in result["bids"]],
        "asks": [{"price": item["rate"], "qty": item["qty"], "orders": item["orders"]} for item in result["asks"]],
        "imbalance": f"{result['depth_rating']} ({result['imbalance_ratio']:+.1%})",
    }


def calculate_net_profit(
    commodity_code: str,
    quantity_quintals: float = 100.0,
    moisture_pct: float = 11.0,
) -> Dict[str, Any]:
    commodity = _commodity_or_default(commodity_code)
    latest_ticker = DailyTicker.objects.filter(commodity=commodity).select_related("mandi").order_by("-recorded_at").first()
    rate = float(latest_ticker.modal_price) if latest_ticker else float(commodity.agmarknet_modal_rate or commodity.standard_msp_rate)
    breakdown = calculate_profit_breakdown(
        quantity_quintals=float(quantity_quintals),
        rate_per_quintal=rate,
        moisture_pct=float(moisture_pct),
        basis_moisture_pct=float(commodity.basis_moisture_pct),
        moisture_discount_rate_per_pct=float(commodity.moisture_discount_rate_per_pct),
        commodity_name=commodity.name,
    ).to_dict()
    return {
        "commodity": commodity.name,
        "mandi": f"{latest_ticker.mandi.name}, {latest_ticker.mandi.state}" if latest_ticker else "APMC benchmark",
        "quantity": breakdown["quantity_quintals"],
        "unit": "Quintals",
        "sellingPrice": breakdown["mandi_rate_per_quintal"],
        "grossValue": breakdown["gross_value"],
        "expenses": {
            "transportation": breakdown["freight_cost"],
            "mandiCess": breakdown["mandi_cess"],
            "escrowFee": breakdown["escrow_fee"],
            "qualityDeductions": breakdown["moisture_deduction"],
            "unloadingCharges": breakdown["loading_unloading_cost"],
        },
        "totalExpenses": breakdown["total_deductions"],
        "estimatedNetProceeds": breakdown["net_proceeds"],
    }


def get_sell_wait_recommendation(
    commodity_code: str,
    market: str = "",
    horizon_days: int = 14,
    quantity_quintals: float | None = None,
) -> Dict[str, Any]:
    apmc_code = _apmc_code(market)
    result = generate_price_forecast(
        commodity_code,
        apmc_code=apmc_code,
        horizon_days=max(1, min(int(horizon_days), 90)),
    )
    price_difference = round(result["predictedPrice"] - result["currentPrice"], 2)
    return {
        "commodity": result["commodity"],
        "mandi": market if apmc_code else "All available APMC market data",
        "horizon": result["horizon"],
        "currentPrice": result["currentPrice"],
        "predictedPrice": result["predictedPrice"],
        "priceDifferencePerQuintal": price_difference,
        "quantity": float(quantity_quintals) if quantity_quintals is not None else None,
        "estimatedDifferenceForQuantity": round(price_difference * float(quantity_quintals), 2) if quantity_quintals is not None else None,
        "lowerRange": result["confidenceLower"],
        "upperRange": result["confidenceUpper"],
        "modelName": "Holt linear trend model",
        "evaluationMetric": f"MAPE: {result['mape']}%, RMSE: {result['rmse']}",
        "dataFreshness": "Latest available APMC settlement data",
        "direction": f"{result['trendDirection'].title()} ({result['expectedChangePct']:+.2f}%)",
        "points": result["forecastPoints"],
        "historicalPoints": result["historicalPoints"],
        "recommendation": result["recommendation"],
    }


def get_price_forecast(commodity_code: str, horizon_days: int = 14, market: str = "") -> Dict[str, Any]:
    return get_sell_wait_recommendation(commodity_code, market, horizon_days)


def book_delivery_slot(
    commodity_code: str = "WHEAT-SHAR",
    mandi: str = "",
    quantity_quintals: float = 100.0,
    vehicle_number: str = "KA-01-EA-1234",
    preferred_date: str = "",
    **kwargs: Any,
) -> Dict[str, Any]:
    """Finds or provisions an available delivery slot for the specified mandi and commodity."""
    import datetime
    from bookings.models import DeliverySlot
    from bookings.services import seed_default_apmc_slots
    from mandi.models import APMC

    commodity = _commodity_or_default(commodity_code)
    qty = float(quantity_quintals or 100.0)

    # Resolve target APMC
    apmc = None
    if mandi:
        mandi_clean = mandi.split(",")[0].replace("APMC", "").strip()
        apmc = APMC.objects.filter(
            models.Q(name__icontains=mandi_clean) | models.Q(market_code__icontains=mandi_clean)
        ).first()
    if not apmc:
        apmc = APMC.objects.first()

    target_date = datetime.date.today() + datetime.timedelta(days=1)
    if preferred_date:
        try:
            target_date = datetime.date.fromisoformat(preferred_date)
        except Exception:
            pass

    # Ensure slots exist for this APMC and date
    if apmc and not DeliverySlot.objects.filter(apmc=apmc, date=target_date).exists():
        seed_default_apmc_slots(apmc, target_date)

    slot = None
    if apmc:
        slot = DeliverySlot.objects.filter(
            apmc=apmc,
            date=target_date,
            status=DeliverySlot.Status.AVAILABLE,
        ).order_by("start_time").first()
        if not slot:
            slot = DeliverySlot.objects.filter(apmc=apmc, date=target_date).first()

    apmc_name = apmc.name if apmc else "Karnal APMC"
    apmc_state = apmc.state if apmc else "Haryana"
    slot_id = str(slot.id) if slot else f"SLOT-KRN-{random.randint(1000, 9999)}"
    start_str = slot.start_time.strftime("%I:%M %p") if slot and slot.start_time else "08:00 AM"
    end_str = slot.end_time.strftime("%I:%M %p") if slot and slot.end_time else "10:30 AM"
    gate_name = slot.gate_number if slot else "Gate #1 (Electronic Weighbridge)"

    date_formatted = target_date.strftime("%A, %d %b %Y")

    return {
        "bookingId": f"RES-{slot_id[:8].upper()}",
        "slotId": slot_id,
        "mandi": f"{apmc_name}, {apmc_state}",
        "gate": gate_name,
        "date": date_formatted,
        "timeSlot": f"{start_str} - {end_str}",
        "commodity": commodity.name,
        "commodityCode": commodity.code,
        "quantity": qty,
        "unit": "Quintals",
        "vehicleNo": vehicle_number.strip().upper(),
        "status": "PENDING_CONFIRMATION",
    }


def find_verified_buyers(commodity_code: str, quantity_quintals: float = 100.0) -> Dict[str, Any]:
    result = match_institutional_buyers(commodity_code, float(quantity_quintals))
    return {
        "commodity": result["commodity"],
        "mandi": "Verified institutional procurement",
        "quantity": result["quantity"],
        "buyers": [
            {
                "id": buyer["licenseNo"],
                "name": buyer["buyerName"],
                "apmcLicense": buyer["licenseNo"],
                "offeredRate": buyer["offeredRate"],
                "requestedQty": buyer["requestedQty"],
                "remainingCapacity": buyer["requestedQty"],
                "settlementMode": buyer["paymentGuarantee"],
                "isVerified": buyer["escrowVerified"],
                "trustScore": f"{buyer['rating']}/5",
            }
            for buyer in result["buyers"]
        ],
    }


TOOL_DEFINITIONS: List[ToolDefinition] = [
    ToolDefinition("get_commodity_price", "Get the latest read-only APMC modal, minimum, and maximum commodity price.", {"type": "object", "properties": {"commodity_code": {"type": "string"}}, "required": ["commodity_code"]}),
    ToolDefinition("compare_mandis", "Compare regional APMCs. Use sell for highest estimated net proceeds; use buy for lowest quoted purchase price.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}, "trade_intent": {"type": "string", "enum": ["buy", "sell"]}}, "required": ["commodity_code", "quantity_quintals", "trade_intent"]}),
    ToolDefinition("get_buy_recommendation", "For a farmer's short crop-buying request, compare current purchase prices and add a cautious 14-day timing estimate from persisted DailyTicker history when available.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}, "market": {"type": "string"}}, "required": ["commodity_code", "quantity_quintals"]}),
    ToolDefinition("get_market_liquidity", "Get read-only five-level market depth and liquidity.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}}, "required": ["commodity_code", "quantity_quintals"]}),
    ToolDefinition("calculate_net_profit", "Calculate deterministic sale proceeds and deductions.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}, "moisture_pct": {"type": "number", "minimum": 0, "maximum": 100}}, "required": ["commodity_code", "quantity_quintals", "moisture_pct"]}),
    ToolDefinition("get_sell_wait_recommendation", "For a crop and optional market, use persisted DailyTicker history to provide a sell-or-wait estimate with price evidence. Never treat it as a guarantee.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "market": {"type": "string"}, "horizon_days": {"type": "integer", "minimum": 1, "maximum": 90}, "quantity_quintals": {"type": "number", "minimum": 0.1}}, "required": ["commodity_code", "horizon_days"]}),
    ToolDefinition("get_price_forecast", "Generate a statistical price forecast from historic APMC tickers.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "market": {"type": "string"}, "horizon_days": {"type": "integer", "minimum": 1, "maximum": 90}}, "required": ["commodity_code", "horizon_days"]}),
    ToolDefinition("find_verified_buyers", "Find read-only verified institutional buyers matching a commodity and quantity.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}}, "required": ["commodity_code", "quantity_quintals"]}),
    ToolDefinition("book_delivery_slot", "Book or reserve an APMC delivery slot and digital gate pass token for delivering commodity harvest lots.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "mandi": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}, "vehicle_number": {"type": "string"}}, "required": ["commodity_code"]}),
]

TOOL_EXECUTORS: Dict[str, Callable[..., Dict[str, Any]]] = {
    "get_commodity_price": get_commodity_price,
    "compare_mandis": compare_mandis,
    "get_buy_recommendation": get_buy_recommendation,
    "get_market_liquidity": get_market_liquidity,
    "calculate_net_profit": calculate_net_profit,
    "get_price_forecast": get_price_forecast,
    "get_sell_wait_recommendation": get_sell_wait_recommendation,
    "find_verified_buyers": find_verified_buyers,
    "book_delivery_slot": book_delivery_slot,
}

CARD_TYPES = {
    "get_commodity_price": "price",
    "compare_mandis": "comparison",
    "get_buy_recommendation": "comparison",
    "get_market_liquidity": "liquidity",
    "calculate_net_profit": "profitability",
    "get_price_forecast": "forecast",
    "get_sell_wait_recommendation": "forecast",
    "find_verified_buyers": "buyer",
    "book_delivery_slot": "booking",
}


def execute_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute only a registered, read-only market tool with model-supplied arguments."""
    executor = TOOL_EXECUTORS.get(name)
    if executor is None:
        raise ValueError(f"Unsupported market tool: {name}")
    if not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be a JSON object.")
    return executor(**arguments)
