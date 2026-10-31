from datetime import date

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import DeliverySlot, SlotBooking
from bookings.serializers import CreateSlotBookingInputSerializer, DeliverySlotSerializer, SlotBookingSerializer
from bookings.services import create_slot_booking_atomic, seed_default_apmc_slots
from mandi.models import APMC


class SlotAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        apmc_lookup = request.query_params.get("apmc")
        target_date = request.query_params.get("date") or date.today().isoformat()
        try:
            parsed_date = date.fromisoformat(target_date)
        except ValueError:
            return Response({"detail": "date must use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        apmcs = APMC.objects.all()
        if apmc_lookup:
            apmcs = apmcs.filter(market_code=apmc_lookup) | apmcs.filter(id=apmc_lookup)
        if not apmcs.exists():
            return Response({"detail": "APMC not found."}, status=status.HTTP_404_NOT_FOUND)

        for apmc in apmcs:
            if not DeliverySlot.objects.filter(apmc=apmc, date=parsed_date).exists():
                seed_default_apmc_slots(apmc, parsed_date)

        slots = DeliverySlot.objects.filter(apmc__in=apmcs, date=parsed_date).order_by("apmc__name", "start_time")
        return Response(DeliverySlotSerializer(slots, many=True).data)


class CreateSlotBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateSlotBookingInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        booking = create_slot_booking_atomic(
            farmer_user=request.user,
            slot_id=str(data["slot_id"]),
            commodity_code=data["commodity_code"],
            quantity_quintals=data["quantity_quintals"],
            vehicle_number=data["vehicle_number"],
            driver_phone=data.get("driver_phone", ""),
            idempotency_key=str(data["idempotency_key"]) if data.get("idempotency_key") else None,
        )
        return Response(SlotBookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = SlotBooking.objects.filter(farmer=request.user).select_related("slot", "commodity").order_by("-created_at")
        return Response(SlotBookingSerializer(bookings, many=True).data)
