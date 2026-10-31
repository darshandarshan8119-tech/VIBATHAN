from decimal import Decimal

from rest_framework import serializers

from transactions.models import MarketTransaction, TransactionLifecycleEvent


class TransactionLifecycleEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.full_name", read_only=True)

    class Meta:
        model = TransactionLifecycleEvent
        fields = ["id", "action", "from_status", "to_status", "actor_name", "verification_hash", "created_at"]


class MarketTransactionSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source="seller.full_name", read_only=True)
    seller_phone = serializers.CharField(source="seller.phone", read_only=True)
    buyer_name = serializers.CharField(source="buyer.full_name", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    commodity_code = serializers.CharField(source="commodity.code", read_only=True)
    apmc_name = serializers.CharField(source="apmc.name", read_only=True)
    lifecycle_events = TransactionLifecycleEventSerializer(many=True, read_only=True)

    class Meta:
        model = MarketTransaction
        fields = [
            "id", "transaction_id", "contract_note_number", "seller_name", "seller_phone", "buyer_name",
            "commodity_name", "commodity_code", "apmc_name", "quantity_quintals", "agreed_rate", "gross_amount",
            "mandi_cess", "escrow_fee", "freight_deduction", "assay_deduction", "net_seller_payable", "status",
            "escrow_deposit_hash", "contract_note_pdf_url", "lifecycle_events", "created_at", "updated_at",
        ]


class TransactionCreateSerializer(serializers.Serializer):
    buyer_id = serializers.UUIDField()
    commodity_code = serializers.CharField(max_length=40)
    apmc_id = serializers.UUIDField()
    quantity_quintals = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.1"))
    agreed_rate = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    distance_km = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0, default=40)
    moisture_pct = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100, default=11)


class TransactionTransitionInputSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["fund_escrow", "dispatch_goods", "pass_assay", "accept_inward", "release_funds"])
