from common.security import constant_time_equal, hash_external_key, stable_json_hash


def test_stable_json_hash_is_order_independent():
    assert stable_json_hash({"b": 2, "a": 1}) == stable_json_hash({"a": 1, "b": 2})


def test_hash_external_key_scopes_keys():
    assert hash_external_key("orders", "same-key") != hash_external_key("bids", "same-key")


def test_constant_time_equal_matches_exact_values():
    assert constant_time_equal("abc", "abc")
    assert not constant_time_equal("abc", "abd")
