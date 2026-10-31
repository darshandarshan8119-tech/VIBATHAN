from rest_framework import serializers
from users.models import CustomUser, FarmerProfile, MerchantProfile


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = ["farm_acreage", "soil_type", "irrigation_type", "kisan_card_number_last4"]


class MerchantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantProfile
        fields = ["company_name", "apmc_license_no", "gst_number_last4", "credit_limit", "risk_status"]


class UserSerializer(serializers.ModelSerializer):
    farmer_profile = FarmerProfileSerializer(read_only=True)
    merchant_profile = MerchantProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "phone",
            "email",
            "role",
            "full_name",
            "village_pincode",
            "is_verified",
            "farmer_profile",
            "merchant_profile",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Phone number or email address")
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    role = serializers.ChoiceField(choices=CustomUser.Role.choices, required=False)


class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    full_name = serializers.CharField(max_length=180)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=CustomUser.Role.choices, default=CustomUser.Role.FARMER)
    email = serializers.EmailField(required=False, allow_blank=True)
    village_pincode = serializers.CharField(max_length=6, required=False, allow_blank=True)

    # Optional role profile details
    farm_acreage = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=10.0)
    company_name = serializers.CharField(max_length=180, required=False, allow_blank=True)
    apmc_license_no = serializers.CharField(max_length=80, required=False, allow_blank=True)

