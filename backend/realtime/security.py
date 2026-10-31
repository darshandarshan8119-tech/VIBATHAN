from fastapi import Header, HTTPException, status


async def require_bearer_token(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")

    # Replace with EdDSA/JWKS verification in the production auth milestone.
    return {"sub": "dev-user", "role": "merchant", "token": token}
