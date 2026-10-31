from agrimart.celery import app
from mandi.services import settle_expired_lots


@app.task(queue="critical", autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def settle_expired_lots_task() -> int:
    return settle_expired_lots()
