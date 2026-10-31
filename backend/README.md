# AgriMart Market Intelligence Backend

This backend service runs Django 5.x REST Framework and FastAPI to power the standalone AgriMart Market Intelligence platform.

## Applications

* `agrimart`: Core project settings, JWT configuration, security headers, Celery task broker.
* `users`: CustomUser model, FarmerProfile, MerchantProfile, registration and login endpoints.
* `mandi`: APMC mandis, commodities, daily tickers, active auction lots, merchant bids, settlements.
* `common`: Audit logging, outbox pattern, idempotency key reservations, seed management commands.
* `realtime`: FastAPI high-frequency bidding endpoint and WebSockets for live mandi ticks.

## Running Tests

```bash
pytest tests -v
```

## Running the Server

```bash
python manage.py runserver 0.0.0.0:8000
```

