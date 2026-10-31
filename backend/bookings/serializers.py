from decimal import Decimal

from rest_framework import serializers

from bookings.models import DeliverySlot, SlotBooking


class DeliverySlotSerializer(serializers.ModelSerializer):
    remaining_capacity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = DeliverySlot
        fields = [
            "id", "apmc", "date", "start_time", "end_time", "gate_number",
            "max_capacity_quintals", "booked_capacity_quintals", "remaining_capacity", "status",
        ]


class SlotBookingSerializer(serializers.ModelSerializer):
    slot_detail = DeliverySlotSerializer(source="slot", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)

    class Meta:
        model = SlotBooking
        fields = [
            "id", "booking_reference", "slot_detail", "commodity_name", "estimated_quantity_quintals",
            "vehicle_number", "driver_phone", "status", "qr_code_token", "created_at",
        ]


class CreateSlotBookingInputSerializer(serializers.Serializer):
    slot_id = serializers.UUIDField()
    commodity_code = serializers.CharField(max_length=40)
    quantity_quintals = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.1"))
    vehicle_number = serializers.CharField(max_length=30)
    driver_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    idempotency_key = serializers.UUIDField(required=False)
