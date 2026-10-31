import hashlib
import random
import uuid
from decimal import Decimal
from django.db import transaction
from rest_framework.exceptions import ValidationError

from bookings.models import DeliverySlot, SlotBooking
from mandi.models import APMC, Commodity


def create_slot_booking_atomic(
    farmer_user,
    slot_id: str,
    commodity_code: str,
    quantity_quintals: float,
    vehicle_number: str,
    driver_phone: str = "",
    idempotency_key: str = None,
) -> SlotBooking:
    """
    Executes transactional slot booking with pessimistic row-level locking (select_for_update)
    to prevent overbooking race conditions during high-concurrency harvest periods.
    """
    qty = Decimal(str(quantity_quintals))
    if qty <= 0:
        raise ValidationError({"error": "Quantity must be greater than zero."})

    # Check idempotency
    idem_uuid = None
    if idempotency_key:
        try:
            idem_uuid = uuid.UUID(str(idempotency_key))
            existing = SlotBooking.objects.filter(farmer=farmer_user, idempotency_key=idem_uuid).first()
            if existing:
                return existing
        except (ValueError, TypeError):
            idem_uuid = None

    try:
        commodity = Commodity.objects.get(code=commodity_code)
    except Commodity.DoesNotExist:
        commodity = Commodity.objects.first()
    if commodity is None:
        raise ValidationError({"error": "No commodities are available for booking."})

    with transaction.atomic():
        try:
            slot = DeliverySlot.objects.select_for_update().get(id=slot_id)
        except DeliverySlot.DoesNotExist:
            raise ValidationError({"error": "Selected delivery slot does not exist."})

        if slot.status == DeliverySlot.Status.FULL:
            raise ValidationError({"error": "Delivery slot is fully booked. Please select an alternate slot."})

        if slot.booked_capacity_quintals + qty > slot.max_capacity_quintals:
            remaining = slot.max_capacity_quintals - slot.booked_capacity_quintals
            raise ValidationError({
                "error": f"Requested quantity ({qty} Qtl) exceeds remaining slot capacity ({remaining} Qtl)."
            })

        # Update slot capacity
        slot.booked_capacity_quintals += qty
        if slot.booked_capacity_quintals >= slot.max_capacity_quintals:
            slot.status = DeliverySlot.Status.FULL
        slot.save(update_fields=["booked_capacity_quintals", "status"])

        # Generate unique booking reference
        random_suffix = "".join(random.choices("0123456789ABCDEF", k=4))
        ref_code = f"SLOT-2026-{slot.apmc.market_code[-3:]}-{random_suffix}"

        # Generate cryptographic QR token
        qr_raw = f"{ref_code}:{farmer_user.phone}:{slot.id}:{qty}"
        qr_hash = hashlib.sha256(qr_raw.encode("utf-8")).hexdigest()[:24].upper()

        booking = SlotBooking.objects.create(
            booking_reference=ref_code,
            slot=slot,
            farmer=farmer_user,
            commodity=commodity,
            estimated_quantity_quintals=qty,
            vehicle_number=vehicle_number.strip().upper(),
            driver_phone=driver_phone or farmer_user.phone,
            qr_code_token=qr_hash,
            idempotency_key=idem_uuid,
            status=SlotBooking.Status.CONFIRMED,
        )

        return booking


def seed_default_apmc_slots(apmc: APMC, target_date) -> None:
    """
    Seeds initial time windows for an APMC on a given date if none exist.
    """
    import datetime

    time_windows = [
        (datetime.time(8, 0), datetime.time(10, 0), "Gate #1 (North Inward)"),
        (datetime.time(10, 0), datetime.time(12, 0), "Gate #1 (North Inward)"),
        (datetime.time(12, 0), datetime.time(14, 0), "Gate #2 (Central Pit)"),
        (datetime.time(14, 0), datetime.time(16, 0), "Gate #2 (Central Pit)"),
    ]

    for start_t, end_t, gate in time_windows:
        DeliverySlot.objects.get_or_create(
            apmc=apmc,
            date=target_date,
            start_time=start_t,
            end_time=end_t,
            gate_number=gate,
            defaults={
                "max_capacity_quintals": Decimal("800.00"),
                "booked_capacity_quintals": Decimal("0.00"),
                "status": DeliverySlot.Status.AVAILABLE,
            },
        )

