from rest_framework import serializers

from mandi.models import APMC, AuctionLot, Commodity, DailyTicker, MerchantBid


class APMCSerializer(serializers.ModelSerializer):
    class Meta:
        model = APMC
        fields = ["id", "name", "state", "district", "market_code", "latitude", "longitude"]


class CommoditySerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity
        fields = ["id", "name", "code", "category", "standard_msp_rate"]


class DailyTickerSerializer(serializers.ModelSerializer):
    mandi_name = serializers.CharField(source="mandi.name", read_only=True)
    mandi_district = serializers.CharField(source="mandi.district", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)

    class Meta:
        model = DailyTicker
        fields = [
            "id",
            "mandi",
            "mandi_name",
            "mandi_district",
            "commodity",
            "commodity_name",
            "modal_price",
            "min_price",
            "max_price",
            "arrivals_volume",
            "recorded_at",
        ]


class AuctionLotSerializer(serializers.ModelSerializer):
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    apmc_name = serializers.CharField(source="apmc.name", read_only=True)
    farmer_name = serializers.CharField(source="farmer.full_name", read_only=True)

    class Meta:
        model = AuctionLot
        fields = [
            "id",
            "farmer",
            "farmer_name",
            "commodity",
            "commodity_name",
            "apmc",
            "apmc_name",
            "quantity_quintals",
            "moisture_pct",
            "reserve_price",
            "current_highest_bid",
            "status",
            "expires_at",
            "created_at",
        ]


class PlaceBidSerializer(serializers.Serializer):
    bid_amount_per_qtl = serializers.DecimalField(max_digits=12, decimal_places=2)
    idempotency_key = serializers.CharField(max_length=80)
