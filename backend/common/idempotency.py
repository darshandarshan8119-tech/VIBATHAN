from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from common.models import IdempotencyKey
from common.security import hash_external_key, stable_json_hash


class IdempotencyConflict(Exception):
    pass


def reserve_idempotency_key(scope: str, key: str, request_payload: object, ttl_hours: int = 24) -> IdempotencyKey:
    key_hash = hash_external_key(scope, key)
    request_hash = stable_json_hash(request_payload)
    expires_at = timezone.now() + timedelta(hours=ttl_hours)

    with transaction.atomic():
        record, created = IdempotencyKey.objects.select_for_update().get_or_create(
            key_hash=key_hash,
            defaults={
                "scope": scope,
                "request_hash": request_hash,
                "expires_at": expires_at,
            },
        )
        if not created and record.request_hash != request_hash:
            raise IdempotencyConflict("Idempotency key reused with a different request payload")
        return record
