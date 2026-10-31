import datetime
from decimal import Decimal
from django.db import transaction
from mandi.models import APMC, Commodity, DailyTicker


def seed_historical_ticker_series(days_back: int = 90) -> int:
    """
    Backfills persisted DailyTicker observations over a 90-day window without
    generating random price curves. Missing records carry forward each market's
    latest recorded benchmark, making the provenance explicit in ``source``.
    """
    today = datetime.date(2026, 10, 31)
    commodities = list(Commodity.objects.all())
    apmcs = list(APMC.objects.all())

    if not commodities or not apmcs:
        return 0

    created_count = 0
    records_to_create = []

    with transaction.atomic():
        for commodity in commodities:
            for mandi in apmcs:
                latest = DailyTicker.objects.filter(mandi=mandi, commodity=commodity).order_by("-recorded_at").first()
                modal = latest.modal_price if latest else commodity.agmarknet_modal_rate or commodity.standard_msp_rate
                min_price = latest.min_price if latest else modal
                max_price = latest.max_price if latest else modal
                arrivals = latest.arrivals_volume if latest else Decimal("0.000")

                for d in range(days_back - 1, -1, -1):
                    rec_date = today - datetime.timedelta(days=d)
                    if not DailyTicker.objects.filter(
                        mandi=mandi,
                        commodity=commodity,
                        recorded_at=rec_date,
                        source="AGMARKNET_BACKFILL",
                    ).exists():
                        records_to_create.append(
                            DailyTicker(
                                mandi=mandi,
                                commodity=commodity,
                                modal_price=modal,
                                min_price=min_price,
                                max_price=max_price,
                                arrivals_volume=arrivals,
                                source="AGMARKNET_BACKFILL",
                                recorded_at=rec_date,
                            )
                        )

        if records_to_create:
            DailyTicker.objects.bulk_create(records_to_create, ignore_conflicts=True)
            created_count = len(records_to_create)

    return created_count

