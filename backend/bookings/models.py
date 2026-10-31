import uuid
from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from common.models import TimeStampedModel, UUIDPrimaryKeyModel
from mandi.models import APMC, Commodity


class DeliverySlot(UUIDPrimaryKeyModel, TimeStampedModel):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        FULL = "full", "Full"
        MAINTENANCE = "maintenance", "Maintenance"

    apmc = models.ForeignKey(APMC, on_delete=models.CASCADE, related_name="delivery_slots")
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    gate_number = models.CharField(max_length=30, default="Gate #1 (Electronic Weighbridge)")
    max_capacity_quintals = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("600.00"), validators=[MinValueValidator(0)]
    )
    booked_capacity_quintals = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(0)]
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    class Meta:
        indexes = [models.Index(fields=["apmc", "date", "status"])]
        constraints = [
            models.UniqueConstraint(
                fields=["apmc", "date", "start_time", "gate_number"],
                name="unique_apmc_slot_schedule",
            )
        ]

    def __str__(self) -> str:
        return f"{self.apmc.name} | {self.date} {self.start_time}-{self.end_time} ({self.gate_number})"

    @property
    def remaining_capacity(self) -> Decimal:
        return max(self.max_capacity_quintals - self.booked_capacity_quintals, Decimal("0.00"))


class SlotBooking(UUIDPrimaryKeyModel, TimeStampedModel):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CHECKED_IN = "checked_in", "Checked In"
        WEIGHED = "weighed", "Weighed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    booking_reference = models.CharField(max_length=40, unique=True, db_index=True)
    slot = models.ForeignKey(DeliverySlot, on_delete=models.PROTECT, related_name="bookings")
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="slot_bookings")
    commodity = models.ForeignKey(Commodity, on_delete=models.PROTECT)
    estimated_quantity_quintals = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0.1)]
    )
    vehicle_number = models.CharField(max_length=30)
    driver_phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    qr_code_token = models.CharField(max_length=64, blank=True)
    idempotency_key = models.UUIDField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["farmer", "-created_at"])]

    def __str__(self) -> str:
        return f"{self.booking_reference} ({self.farmer.phone} - {self.commodity.name})"

