from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    error_code: str
    detail: str
    trace_id: str | None = None


class BidRequest(BaseModel):
    lot_id: UUID
    bid_amount_per_qtl: Decimal = Field(gt=0)
    idempotency_key: str = Field(min_length=16, max_length=128)


class BidAccepted(BaseModel):
    lot_id: UUID
    bid_id: UUID
    bid_amount_per_qtl: Decimal
    accepted_at: datetime
