from common.models import OutboxEvent


def enqueue_event(event_type: str, aggregate_type: str, aggregate_id, payload: dict, schema_version: int = 1) -> OutboxEvent:
    return OutboxEvent.objects.create(
        event_type=event_type,
        aggregate_type=aggregate_type,
        aggregate_id=aggregate_id,
        payload_json=payload,
        schema_version=schema_version,
    )
