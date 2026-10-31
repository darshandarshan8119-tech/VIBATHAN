from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from mandi.models import APMC, AuctionLot, Commodity, DailyTicker
from mandi.serializers import (
    APMCSerializer,
    AuctionLotSerializer,
    CommoditySerializer,
    DailyTickerSerializer,
    PlaceBidSerializer,
)
from mandi.services import BidRejected, place_bid


class CommodityListView(generics.ListAPIView):
    queryset = Commodity.objects.all().order_by("name")
    serializer_class = CommoditySerializer
    permission_classes = [permissions.AllowAny]


class APMCListView(generics.ListAPIView):
    queryset = APMC.objects.all().order_by("state", "name")
    serializer_class = APMCSerializer
    permission_classes = [permissions.AllowAny]


class DailyTickerListView(generics.ListAPIView):
    serializer_class = DailyTickerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return DailyTicker.objects.select_related("mandi", "commodity").order_by("-recorded_at", "commodity__name")


class AuctionLotListView(generics.ListAPIView):
    serializer_class = AuctionLotSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            AuctionLot.objects.filter(status=AuctionLot.Status.ACTIVE)
            .select_related("commodity", "apmc", "farmer")
            .order_by("-created_at")
        )


class PlaceBidView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lot_id):
        serializer = PlaceBidSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            bid = place_bid(
                merchant=request.user,
                lot_id=lot_id,
                bid_amount_per_qtl=data["bid_amount_per_qtl"],
                idempotency_key=data["idempotency_key"],
            )
            return Response(
                {
                    "status": "success",
                    "bid_id": str(bid.id),
                    "bid_amount_per_qtl": str(bid.bid_amount_per_qtl),
                    "lot_id": str(lot_id),
                },
                status=status.HTTP_201_CREATED,
            )
        except BidRejected as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
