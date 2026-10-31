import pytest
from rest_framework.test import APIClient

from users.models import CustomUser


@pytest.mark.django_db
def test_mandi_health_endpoint():
    client = APIClient()
    response = client.get("/api/v1/mandi/health/", secure=True)
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "module": "mandi"}


@pytest.mark.django_db
def test_commodities_endpoint_returns_success():
    client = APIClient()
    response = client.get("/api/v1/mandi/commodities/", secure=True)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_mandi_tickers_endpoint_returns_success():
    client = APIClient()
    response = client.get("/api/v1/mandi/tickers/", secure=True)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_apmcs_endpoint_returns_success():
    client = APIClient()
    response = client.get("/api/v1/mandi/apmcs/", secure=True)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_auction_lots_endpoint_returns_success():
    client = APIClient()
    response = client.get("/api/v1/mandi/lots/", secure=True)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_auth_login_endpoint_issues_jwt():
    client = APIClient()
    user = CustomUser.objects.create(
        phone="9876540001",
        full_name="Testing Farmer",
        role=CustomUser.Role.FARMER,
        is_verified=True,
    )
    user.set_password("SecurePass1234!")
    user.save()

    response = client.post(
        "/api/v1/auth/login/",
        {"identifier": "9876540001", "password": "SecurePass1234!"},
        format="json",
        secure=True,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert "tokens" in body
    assert "access" in body["tokens"]
    assert "refresh" in body["tokens"]
    assert body["user"]["phone"] == "9876540001"


@pytest.mark.django_db
def test_auth_register_endpoint():
    client = APIClient()
    response = client.post(
        "/api/v1/auth/register/",
        {
            "phone": "9811122233",
            "password": "SecurePass1234!",
            "full_name": "New Kisan Member",
            "role": "farmer",
            "village_pincode": "141001",
            "farm_acreage": 14.5,
        },
        format="json",
        secure=True,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "success"
    assert body["user"]["phone"] == "9811122233"
    assert "tokens" in body


@pytest.mark.django_db
def test_removed_ecommerce_routes_return_404():
    client = APIClient()
    # E-commerce store routes must not be present
    store_resp = client.get("/api/v1/store/products/", secure=True)
    assert store_resp.status_code == 404

    # Equipment rental routes must not be present
    rental_resp = client.get("/api/v1/rentals/equipment/", secure=True)
    assert rental_resp.status_code == 404

