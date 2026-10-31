from django.http import JsonResponse
from django.urls import path

from mandi.views import (
    APMCListView,
    AuctionLotListView,
    CommodityListView,
    DailyTickerListView,
    PlaceBidView,
)


def mandi_health(_request):
    return JsonResponse({"status": "ok", "module": "mandi"})


urlpatterns = [
    path("health/", mandi_health, name="mandi-health"),
    path("commodities/", CommodityListView.as_view(), name="commodity-list"),
    path("apmcs/", APMCListView.as_view(), name="apmc-list"),
    path("tickers/", DailyTickerListView.as_view(), name="ticker-list"),
    path("lots/", AuctionLotListView.as_view(), name="lot-list"),
    path("lots/<uuid:lot_id>/bid/", PlaceBidView.as_view(), name="place-bid"),
]
