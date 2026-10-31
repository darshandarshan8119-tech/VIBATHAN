from django.urls import path

from bookings.views import CreateSlotBookingView, MyBookingsView, SlotAvailabilityView


urlpatterns = [
    path("availability/", SlotAvailabilityView.as_view(), name="slot-availability"),
    path("", CreateSlotBookingView.as_view(), name="create-booking"),
    path("my-bookings/", MyBookingsView.as_view(), name="my-bookings"),
]
