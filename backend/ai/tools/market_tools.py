"""Safe, read-only adapters around AgriMart's deterministic market engines."""

from typing import Any, Callable, Dict, List

from ai.llm.base import ToolDefinition
from ai.forecasting.predictor import generate_price_forecast
from analytics.buyer_matching import match_institutional_buyers
from analytics.liquidity_analysis import analyze_market_liquidity
from analytics.mandi_comparison import compare_regional_mandis
from analytics.profit_calculator import calculate_net_profit as calculate_profit_breakdown
from mandi.models import Commodity, DailyTicker


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


def compare_mandis(commodity_code: str, quantity_quintals: float = 100.0) -> Dict[str, Any]:
    return compare_regional_mandis(commodity_code, float(quantity_quintals))


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


def get_price_forecast(commodity_code: str, horizon_days: int = 14) -> Dict[str, Any]:
    result = generate_price_forecast(commodity_code, horizon_days=max(1, min(int(horizon_days), 90)))
    return {
        "commodity": result["commodity"],
        "mandi": "APMC market trajectory",
        "horizon": result["horizon"],
        "currentPrice": result["currentPrice"],
        "predictedPrice": result["predictedPrice"],
        "lowerRange": result["confidenceLower"],
        "upperRange": result["confidenceUpper"],
        "modelName": "Holt linear trend model",
        "evaluationMetric": f"MAPE: {result['mape']}%, RMSE: {result['rmse']}",
        "dataFreshness": "Latest available APMC settlement data",
        "direction": f"{result['trendDirection'].title()} ({result['expectedChangePct']:+.2f}%)",
        "points": result["forecastPoints"],
        "recommendation": result["recommendation"],
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
    ToolDefinition("compare_mandis", "Compare regional APMCs by deterministic net proceeds.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}}, "required": ["commodity_code", "quantity_quintals"]}),
    ToolDefinition("get_market_liquidity", "Get read-only five-level market depth and liquidity.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}}, "required": ["commodity_code", "quantity_quintals"]}),
    ToolDefinition("calculate_net_profit", "Calculate deterministic sale proceeds and deductions.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}, "moisture_pct": {"type": "number", "minimum": 0, "maximum": 100}}, "required": ["commodity_code", "quantity_quintals", "moisture_pct"]}),
    ToolDefinition("get_price_forecast", "Generate a statistical price forecast from historic APMC tickers.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "horizon_days": {"type": "integer", "minimum": 1, "maximum": 90}}, "required": ["commodity_code", "horizon_days"]}),
    ToolDefinition("find_verified_buyers", "Find read-only verified institutional buyers matching a commodity and quantity.", {"type": "object", "properties": {"commodity_code": {"type": "string"}, "quantity_quintals": {"type": "number", "minimum": 0.1}}, "required": ["commodity_code", "quantity_quintals"]}),
]

TOOL_EXECUTORS: Dict[str, Callable[..., Dict[str, Any]]] = {
    "get_commodity_price": get_commodity_price,
    "compare_mandis": compare_mandis,
    "get_market_liquidity": get_market_liquidity,
    "calculate_net_profit": calculate_net_profit,
    "get_price_forecast": get_price_forecast,
    "find_verified_buyers": find_verified_buyers,
}

CARD_TYPES = {
    "get_commodity_price": "price",
    "compare_mandis": "comparison",
    "get_market_liquidity": "liquidity",
    "calculate_net_profit": "profitability",
    "get_price_forecast": "forecast",
    "find_verified_buyers": "buyer",
}


def execute_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute only a registered, read-only market tool with model-supplied arguments."""
    executor = TOOL_EXECUTORS.get(name)
    if executor is None:
        raise ValueError(f"Unsupported market tool: {name}")
    if not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be a JSON object.")
    return executor(**arguments)
