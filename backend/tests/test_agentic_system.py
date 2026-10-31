from datetime import date, time
from decimal import Decimal

import pytest
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from ai.forecasting.predictor import generate_price_forecast
from ai.forecasting.seed_historical_tickers import seed_historical_ticker_series
from analytics.liquidity_analysis import analyze_market_liquidity
from analytics.mandi_comparison import compare_regional_mandis
from analytics.profit_calculator import calculate_net_profit
from ai.tools.market_tools import compare_mandis, get_sell_wait_recommendation
from bookings.models import DeliverySlot
from bookings.services import create_slot_booking_atomic
from mandi.models import APMC, Commodity
from transactions.models import MarketTransaction
from users.models import CustomUser, MerchantProfile


@pytest.fixture
def market_catalog(db):
    apmc = APMC.objects.create(name="Test APMC", state="Punjab", district="Ludhiana", market_code="TST-LUD")
    commodity = Commodity.objects.create(
        name="Test Wheat", code="WHEAT-SHAR", category="Cereals", standard_msp_rate=Decimal("2275"),
        agmarknet_modal_rate=Decimal("2400"), basis_moisture_pct=Decimal("11"), moisture_discount_rate_per_pct=Decimal("30"),
    )
    return apmc, commodity


@pytest.fixture
def farmer(db):
    return CustomUser.objects.create(phone="9876543210", full_name="Ramesh Kumar", role=CustomUser.Role.FARMER, is_verified=True)


@pytest.fixture
def merchant(db):
    user = CustomUser.objects.create(phone="9123456780", full_name="Mandi Merchant", role=CustomUser.Role.MERCHANT, is_verified=True)
    MerchantProfile.objects.create(user=user, company_name="Mandi Merchant", apmc_license_no="PB-TEST-001")
    return user


def test_profit_calculator_deterministic_deductions():
    profit = calculate_net_profit(quantity_quintals=100, rate_per_quintal=2400, distance_km=40, moisture_pct=11)
    assert profit.gross_value == 240000
    assert profit.mandi_cess == 3600
    assert profit.escrow_fee == 1200
    assert profit.freight_cost == 720
    assert profit.loading_unloading_cost == 1500
    assert profit.net_proceeds == 232980


@pytest.mark.django_db
def test_market_analytics_and_forecast_use_persisted_tickers(market_catalog):
    _, commodity = market_catalog
    seed_historical_ticker_series(90)
    comparison = compare_regional_mandis(commodity.code, quantity_quintals=100)
    proceeds = [item["estimatedNetProceeds"] for item in comparison["mandis"]]
    assert proceeds == sorted(proceeds, reverse=True)

    liquidity = analyze_market_liquidity(commodity.code, target_quantity_quintals=100)
    assert len(liquidity["bids"]) == len(liquidity["asks"]) == 5
    assert liquidity["best_bid"] < liquidity["best_ask"]

    forecast = generate_price_forecast(commodity.code, horizon_days=14)
    assert len(forecast["forecastPoints"]) == 14
    assert forecast["confidenceLower"] <= forecast["predictedPrice"] <= forecast["confidenceUpper"]


@pytest.mark.django_db
def test_sell_wait_and_buy_comparison_are_data_backed(market_catalog):
    _, commodity = market_catalog
    seed_historical_ticker_series(90)
    decision = get_sell_wait_recommendation(commodity.code, "Test APMC", 14, 100)
    assert decision["currentPrice"] > 0
    assert decision["predictedPrice"] > 0
    assert decision["estimatedDifferenceForQuantity"] == decision["priceDifferencePerQuintal"] * 100

    buying = compare_mandis(commodity.code, 100, "buy")
    quotes = [mandi["quotedRate"] for mandi in buying["mandis"]]
    assert buying["tradeIntent"] == "buy"
    assert quotes == sorted(quotes)


@pytest.mark.django_db
def test_unknown_crop_uses_labeled_demo_comparison_data():
    buying = compare_mandis("ragi", 100, "buy")
    selling = compare_mandis("ragi", 100, "sell")
    assert buying["isMockData"] is True
    assert "Demo" in buying["dataNotice"]
    assert buying["mandis"][0]["quotedRate"] == min(row["quotedRate"] for row in buying["mandis"])
    assert selling["mandis"][0]["estimatedNetProceeds"] == max(row["estimatedNetProceeds"] for row in selling["mandis"])


@pytest.mark.django_db
def test_slot_booking_capacity_is_atomic(farmer, market_catalog):
    apmc, commodity = market_catalog
    slot = DeliverySlot.objects.create(
        apmc=apmc, date=date.today(), start_time=time(8), end_time=time(10), max_capacity_quintals=Decimal("100"),
    )
    booking = create_slot_booking_atomic(farmer, str(slot.id), commodity.code, 60, "PB-10-XY-1234")
    assert booking.booking_reference.startswith("SLOT-2026-")
    slot.refresh_from_db()
    assert slot.booked_capacity_quintals == Decimal("60")
    with pytest.raises(ValidationError):
        create_slot_booking_atomic(farmer, str(slot.id), commodity.code, 50, "PB-10-XY-5678")


@pytest.mark.django_db
def test_assistant_chat_returns_a_comparison_card(farmer, market_catalog, monkeypatch):
    _, commodity = market_catalog
    seed_historical_ticker_series(90)
    monkeypatch.setenv("LLM_PROVIDER", "rule_based")
    client = APIClient()
    client.force_authenticate(farmer)
    response = client.post(
        "/api/v1/assistant/chat/",
        {"message": f"Compare mandis for 100 quintals of {commodity.name}"},
        format="json",
        secure=True,
    )
    assert response.status_code == 201
    assert response.data["message"]["card_type"] == "comparison"
    assert response.data["message"]["card_data"]["mandis"]
    assert response.data["farmer_explanation"]


@pytest.mark.django_db
def test_internal_escrow_lifecycle_is_sequential(farmer, merchant, market_catalog):
    apmc, commodity = market_catalog
    transaction = MarketTransaction.objects.create(
        seller=farmer, buyer=merchant, commodity=commodity, apmc=apmc, quantity_quintals=10, agreed_rate=2400,
        gross_amount=24000, mandi_cess=360, escrow_fee=120, freight_deduction=72, assay_deduction=0, net_seller_payable=23448,
    )
    assert len(transaction.escrow_deposit_hash) == 64
    with pytest.raises(Exception):
        transaction.transition("dispatch_goods", farmer)
    transaction.transition("fund_escrow", merchant)
    transaction.transition("dispatch_goods", farmer)
    transaction.transition("pass_assay", farmer)
    transaction.transition("accept_inward", merchant)
    transaction.transition("release_funds", merchant)
    transaction.refresh_from_db()
    assert transaction.status == MarketTransaction.LifecycleStatus.FUNDS_RELEASED
    assert transaction.lifecycle_events.count() == 5


@pytest.mark.django_db
def test_assistant_chat_rejects_out_of_domain_coding_queries(farmer):
    client = APIClient()
    client.force_authenticate(farmer)

    # 1. Reject coding query
    response = client.post(
        "/api/v1/assistant/chat/",
        {"message": "Can you write Java code to reverse a binary tree?"},
        format="json",
        secure=True,
    )
    assert response.status_code == 201
    data = response.json()
    assert "AgriMart's Agricultural Market Intelligence Copilot" in data["message"]["content"]
    assert "cannot assist with programming" in data["message"]["content"]
    assert data["message"]["card_type"] is None
    assert data["message"]["card_data"] == {}

    # 2. Reject non-agricultural general trivia
    response2 = client.post(
        "/api/v1/assistant/chat/",
        {"message": "Who was Napoleon and which movies were made about him?"},
        format="json",
        secure=True,
    )
    assert response2.status_code == 201
    assert "AgriMart's Agricultural Market Intelligence Copilot" in response2.json()["message"]["content"]
    assert response2.json()["message"]["card_type"] is None
