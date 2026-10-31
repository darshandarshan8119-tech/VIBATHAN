from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from common.models import TimeStampedModel, UUIDPrimaryKeyModel


class APMC(UUIDPrimaryKeyModel):
    name = models.CharField(max_length=180)
    state = models.CharField(max_length=80)
    district = models.CharField(max_length=80)
    market_code = models.CharField(max_length=40, unique=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.market_code})"


class Commodity(UUIDPrimaryKeyModel):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=40, unique=True)
    ticker_symbol = models.CharField(max_length=24, blank=True, null=True, unique=True)
    variety = models.CharField(max_length=120, blank=True, default="")
    category = models.CharField(max_length=80)
    standard_msp_rate = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    agmarknet_modal_rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    basis_moisture_pct = models.DecimalField(max_digits=5, decimal_places=2, default=11.00)
    moisture_tolerance_pct = models.DecimalField(max_digits=4, decimal_places=2, default=0.50)
    moisture_discount_rate_per_pct = models.DecimalField(max_digits=8, decimal_places=2, default=30.00)
    max_rejection_moisture_pct = models.DecimalField(max_digits=5, decimal_places=2, default=14.00)
    assay_specs = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return f"{self.ticker_symbol or self.code}: {self.name}"


class DailyTicker(UUIDPrimaryKeyModel):
    mandi = models.ForeignKey(APMC, on_delete=models.CASCADE)
    commodity = models.ForeignKey(Commodity, on_delete=models.CASCADE)
    modal_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    min_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    max_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    arrivals_volume = models.DecimalField(max_digits=14, decimal_places=3, validators=[MinValueValidator(0)])
    source = models.CharField(max_length=80)
    recorded_at = models.DateField()

    class Meta:
        indexes = [models.Index(fields=["mandi", "commodity", "-recorded_at"])]
        constraints = [
            models.UniqueConstraint(fields=["mandi", "commodity", "recorded_at", "source"], name="unique_ticker_source_per_day"),
            models.CheckConstraint(condition=models.Q(max_price__gte=models.F("min_price")), name="ticker_max_gte_min"),
        ]


class AuctionLot(UUIDPrimaryKeyModel, TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        LOCKED = "locked", "Locked"
        SETTLED = "settled", "Settled"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="auction_lots")
    commodity = models.ForeignKey(Commodity, on_delete=models.PROTECT)
    apmc = models.ForeignKey(APMC, on_delete=models.PROTECT)
    quantity_quintals = models.DecimalField(max_digits=12, decimal_places=3, validators=[MinValueValidator(0)])
    moisture_pct = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    reserve_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    current_highest_bid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    leading_bid = models.ForeignKey("MerchantBid", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        indexes = [models.Index(fields=["status", "expires_at"])]


class MerchantBid(UUIDPrimaryKeyModel):
    class Status(models.TextChoices):
        LEADING = "leading", "Leading"
        OUTBID = "outbid", "Outbid"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        WITHDRAWN = "withdrawn", "Withdrawn"

    lot = models.ForeignKey(AuctionLot, on_delete=models.CASCADE, related_name="bids")
    merchant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="mandi_bids")
    bid_amount_per_qtl = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.LEADING)
    idempotency_key = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["lot", "-bid_amount_per_qtl", "created_at"])]
        constraints = [models.UniqueConstraint(fields=["lot", "merchant", "idempotency_key"], name="unique_bid_idempotency_per_merchant")]


class Settlement(UUIDPrimaryKeyModel, TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAYABLE = "payable", "Payable"
        PAID = "paid", "Paid"
        DISPUTED = "disputed", "Disputed"
        CANCELLED = "cancelled", "Cancelled"

    lot = models.OneToOneField(AuctionLot, on_delete=models.PROTECT, related_name="settlement")
    winning_bid = models.ForeignKey(MerchantBid, on_delete=models.PROTECT)
    gross_amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    moisture_deduction_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    escrow_reserve_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    farmer_payout_amount = models.DecimalField(max_digits=14, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
