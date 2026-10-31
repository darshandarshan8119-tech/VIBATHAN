from django.contrib import admin

from mandi.models import APMC, AuctionLot, Commodity, DailyTicker, MerchantBid, Settlement

admin.site.register(APMC)
admin.site.register(Commodity)
admin.site.register(DailyTicker)
admin.site.register(AuctionLot)
admin.site.register(MerchantBid)
admin.site.register(Settlement)
