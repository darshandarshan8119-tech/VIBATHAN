import os
from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    jwt_issuer: str = os.getenv("JWT_ISSUER", "agrimart")
    jwt_audience: str = os.getenv("JWT_AUDIENCE", "agrimart-api")
    max_upload_bytes: int = 10 * 1024 * 1024
    max_image_pixels: int = 24_000_000


@lru_cache
def get_settings() -> Settings:
    return Settings()
