import hashlib
import hmac
import json


def constant_time_equal(left: str, right: str) -> bool:
    return hmac.compare_digest(left.encode("utf-8"), right.encode("utf-8"))


def stable_json_hash(payload: object) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def hash_external_key(scope: str, key: str) -> str:
    return hashlib.sha256(f"{scope}:{key}".encode()).hexdigest()
