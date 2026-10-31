from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.profit_calculator import calculate_net_profit
from mandi.models import APMC, Commodity
from transactions.models import MarketTransaction
from transactions.serializers import MarketTransactionSerializer, TransactionCreateSerializer, TransactionTransitionInputSerializer
from users.models import CustomUser, MerchantProfile


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = MarketTransaction.objects.filter(Q(seller=request.user) | Q(buyer=request.user)).select_related(
            "seller", "buyer", "commodity", "apmc"
        ).prefetch_related("lifecycle_events__actor").order_by("-created_at")
        return Response(MarketTransactionSerializer(transactions, many=True).data)

    def post(self, request):
        serializer = TransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        buyer = CustomUser.objects.filter(id=data["buyer_id"], role=CustomUser.Role.MERCHANT, is_verified=True).first()
        if buyer is None or not MerchantProfile.objects.filter(user=buyer, risk_status=MerchantProfile.RiskStatus.NORMAL).exists():
            return Response({"detail": "A verified, eligible merchant buyer is required."}, status=status.HTTP_400_BAD_REQUEST)
        commodity = Commodity.objects.filter(code=data["commodity_code"]).first()
        apmc = APMC.objects.filter(id=data["apmc_id"]).first()
        if commodity is None or apmc is None:
            return Response({"detail": "Commodity or APMC not found."}, status=status.HTTP_400_BAD_REQUEST)

        breakdown = calculate_net_profit(
            quantity_quintals=data["quantity_quintals"],
            rate_per_quintal=data["agreed_rate"],
            distance_km=data["distance_km"],
            moisture_pct=data["moisture_pct"],
            basis_moisture_pct=commodity.basis_moisture_pct,
            moisture_discount_rate_per_pct=commodity.moisture_discount_rate_per_pct,
            commodity_name=commodity.name,
        )
        transaction_record = MarketTransaction.objects.create(
            seller=request.user, buyer=buyer, commodity=commodity, apmc=apmc,
            quantity_quintals=breakdown.quantity_quintals, agreed_rate=breakdown.mandi_rate_per_quintal,
            gross_amount=breakdown.gross_value, mandi_cess=breakdown.mandi_cess, escrow_fee=breakdown.escrow_fee,
            freight_deduction=breakdown.freight_cost, assay_deduction=breakdown.moisture_deduction,
            net_seller_payable=breakdown.net_proceeds,
        )
        return Response(MarketTransactionSerializer(transaction_record).data, status=status.HTTP_201_CREATED)


class TransactionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, transaction_id):
        transaction_record = _find_transaction_for_user(transaction_id, request.user)
        if transaction_record is None:
            return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MarketTransactionSerializer(transaction_record).data)


class TransactionActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, transaction_id):
        serializer = TransactionTransitionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            transaction_record = _find_transaction_for_user(transaction_id, request.user, lock=True)
            if transaction_record is None:
                return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)
            try:
                transaction_record.transition(serializer.validated_data["action"], request.user)
            except DjangoValidationError as exc:
                return Response({"detail": exc.messages[0]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MarketTransactionSerializer(transaction_record).data)


def _find_transaction_for_user(transaction_id, user, lock=False):
    queryset = MarketTransaction.objects.select_related("seller", "buyer", "commodity", "apmc").prefetch_related("lifecycle_events__actor")
    if lock:
        queryset = queryset.select_for_update()
    queryset = queryset.filter(Q(id=transaction_id) | Q(transaction_id=transaction_id) | Q(contract_note_number=transaction_id))
    if not user.is_agrimart_admin:
        queryset = queryset.filter(Q(seller=user) | Q(buyer=user))
    return queryset.first()
