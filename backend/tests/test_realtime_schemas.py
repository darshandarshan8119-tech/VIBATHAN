from decimal import Decimal
from uuid import uuid4

import pytest
from pydantic import ValidationError

from realtime.schemas import BidRequest


def test_bid_request_validation():
    valid = BidRequest(
        lot_id=uuid4(),
        bid_amount_per_qtl=Decimal("2350.50"),
        idempotency_key="a" * 24,
    )
    assert valid.bid_amount_per_qtl == Decimal("2350.50")

    with pytest.raises(ValidationError):
        BidRequest(
            lot_id=uuid4(),
            bid_amount_per_qtl=Decimal("-10.00"),
            idempotency_key="short",
        )

