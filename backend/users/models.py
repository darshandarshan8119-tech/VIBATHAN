from django.contrib.auth.models import AbstractUser
from django.db import models

from common.models import UUIDPrimaryKeyModel


class CustomUser(AbstractUser, UUIDPrimaryKeyModel):
    class Role(models.TextChoices):
        FARMER = "farmer", "Farmer"
        MERCHANT = "merchant", "Merchant"
        ADMIN = "admin", "Admin"
        SUPPORT = "support", "Support"

    username = None
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    full_name = models.CharField(max_length=180)
    village_pincode = models.CharField(max_length=6, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["full_name", "role"]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.phone})"

    @property
    def is_agrimart_admin(self) -> bool:
        return self.role in {self.Role.ADMIN, self.Role.SUPPORT} or self.is_superuser


class FarmerProfile(UUIDPrimaryKeyModel):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="farmer_profile")
    farm_acreage = models.DecimalField(max_digits=10, decimal_places=2)
    soil_type = models.CharField(max_length=80, blank=True)
    irrigation_type = models.CharField(max_length=80, blank=True)
    kisan_card_number_ciphertext = models.BinaryField(null=True, blank=True)
    kisan_card_number_last4 = models.CharField(max_length=4, blank=True)


class MerchantProfile(UUIDPrimaryKeyModel):
    class RiskStatus(models.TextChoices):
        NORMAL = "normal", "Normal"
        REVIEW = "review", "Review"
        BLOCKED = "blocked", "Blocked"

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="merchant_profile")
    company_name = models.CharField(max_length=180)
    apmc_license_no = models.CharField(max_length=80, unique=True)
    gst_number_ciphertext = models.BinaryField(null=True, blank=True)
    gst_number_last4 = models.CharField(max_length=4, blank=True)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    risk_status = models.CharField(max_length=20, choices=RiskStatus.choices, default=RiskStatus.NORMAL)
