import time

import redis.asyncio as redis


class RateLimitExceeded(Exception):
    pass


async def sliding_window_limit(client: redis.Redis, *, key: str, limit: int, window_seconds: int) -> None:
    now = time.time()
    window_start = now - window_seconds
    pipe = client.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    _, _, count, _ = await pipe.execute()
    if count > limit:
        raise RateLimitExceeded(f"Rate limit exceeded for {key}")
