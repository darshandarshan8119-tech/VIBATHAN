from django.urls import path

from transactions.views import TransactionActionView, TransactionDetailView, TransactionListView


urlpatterns = [
    path("", TransactionListView.as_view(), name="transaction-list"),
    path("<str:transaction_id>/", TransactionDetailView.as_view(), name="transaction-detail"),
    path("<str:transaction_id>/action/", TransactionActionView.as_view(), name="transaction-action"),
]
