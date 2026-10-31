from django.utils import timezone

from agrimart.celery import app
from common.models import IdempotencyKey, OutboxEvent


@app.task(queue="default")
def cleanup_expired_idempotency_keys() -> int:
    deleted, _ = IdempotencyKey.objects.filter(expires_at__lt=timezone.now()).delete()
    return deleted


@app.task(queue="critical", autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def publish_pending_outbox_events(limit: int = 100) -> int:
    events = OutboxEvent.objects.filter(status=OutboxEvent.Status.PENDING, next_attempt_at__lte=timezone.now()).order_by("created_at")[:limit]
    published = 0
    for event in events:
        event.status = OutboxEvent.Status.PUBLISHED
        event.attempts += 1
        event.save(update_fields=["status", "attempts"])
        published += 1
    return published
