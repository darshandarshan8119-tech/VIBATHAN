import json
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from uuid import UUID, uuid4

import redis.asyncio as redis
from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware

from realtime.config import get_settings
from realtime.rate_limit import RateLimitExceeded, sliding_window_limit
from realtime.schemas import BidAccepted, BidRequest
from realtime.security import require_bearer_token

settings = get_settings()


@asynccontextmanager
async def lifespan(api: FastAPI):
    api.state.redis = redis.from_url(settings.redis_url, decode_responses=True)
    try:
        yield
    finally:
        await api.state.redis.aclose()


app = FastAPI(title="AgriMart Market Intelligence Realtime Gateway", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type", "X-Idempotency-Key"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "fastapi", "gateway": "market-intelligence"}


@app.post("/api/v1/mandi/bid", response_model=BidAccepted)
async def place_bid(payload: BidRequest, principal: dict = Depends(require_bearer_token)):
    merchant_id = principal["sub"]
    try:
        await sliding_window_limit(
            app.state.redis,
            key=f"rl:bid:{merchant_id}:{payload.lot_id}",
            limit=2,
            window_seconds=1,
        )
    except RateLimitExceeded as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc

    bid_id = uuid4()
    event = {
        "type": "auction.bid_placed",
        "lot_id": str(payload.lot_id),
        "bid_id": str(bid_id),
        "bid_amount_per_qtl": str(payload.bid_amount_per_qtl),
        "merchant_id": merchant_id,
        "accepted_at": datetime.now(UTC).isoformat(),
    }
    await app.state.redis.publish(f"auction:{payload.lot_id}", json.dumps(event))
    return BidAccepted(
        lot_id=payload.lot_id,
        bid_id=bid_id,
        bid_amount_per_qtl=payload.bid_amount_per_qtl,
        accepted_at=datetime.now(UTC),
    )


@app.websocket("/ws/mandi/auction/{lot_id}")
async def auction_socket(websocket: WebSocket, lot_id: UUID):
    await websocket.accept()
    pubsub = app.state.redis.pubsub()
    channel = f"auction:{lot_id}"
    await pubsub.subscribe(channel)
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=25)
            if message:
                await websocket.send_text(message["data"])
            else:
                await websocket.send_json({"type": "heartbeat", "ts": datetime.now(UTC).isoformat()})
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.aclose()


@app.websocket("/ws/mandi/feed")
async def mandi_feed_socket(websocket: WebSocket):
    await websocket.accept()
    pubsub = app.state.redis.pubsub()
    await pubsub.subscribe("mandi_realtime_ticks")
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=25)
            if message:
                await websocket.send_text(message["data"])
            else:
                await websocket.send_json({"type": "heartbeat", "ts": datetime.now(UTC).isoformat()})
    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe("mandi_realtime_ticks")
        await pubsub.aclose()
