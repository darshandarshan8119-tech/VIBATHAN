from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import CustomUser, FarmerProfile, MerchantProfile
from users.serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        phone = data["phone"].strip()
        if CustomUser.objects.filter(phone=phone).exists():
            return Response({"error": "User with this phone number already exists"}, status=status.HTTP_400_BAD_REQUEST)

        email = data.get("email") or f"user_{phone}@agrimart.in"
        role = data.get("role", CustomUser.Role.FARMER)

        user = CustomUser.objects.create(
            phone=phone,
            email=email,
            full_name=data["full_name"],
            role=role,
            village_pincode=data.get("village_pincode", "141001"),
            is_verified=True,
        )
        user.set_password(data["password"])
        user.save()

        if role == CustomUser.Role.FARMER:
            FarmerProfile.objects.create(
                user=user,
                farm_acreage=data.get("farm_acreage", 10.0),
                soil_type="Alluvial Loam",
                irrigation_type="Canal + Borewell",
                kisan_card_number_last4=phone[-4:],
            )
        elif role == CustomUser.Role.MERCHANT:
            MerchantProfile.objects.create(
                user=user,
                company_name=data.get("company_name") or f"{data['full_name']} Trading",
                apmc_license_no=data.get("apmc_license_no") or f"APMC-{phone[-4:]}",
                gst_number_last4="8821",
                credit_limit=500000.00,
            )

        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["full_name"] = user.full_name

        return Response(
            {
                "status": "success",
                "message": "User registered successfully",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class UnifiedLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data.get("password", "")

        # Look up by phone or email
        user = CustomUser.objects.filter(phone=identifier).first()
        if not user:
            user = CustomUser.objects.filter(email=identifier).first()

        # If user not found, create a demo account in development
        if not user:
            role = serializer.validated_data.get("role", CustomUser.Role.FARMER)
            user = CustomUser.objects.create(
                phone=identifier if identifier.isdigit() else f"9{identifier[:9].zfill(9)}",
                email=identifier if "@" in identifier else f"user_{identifier}@agrimart.in",
                full_name=identifier.split("@")[0].capitalize() or "Kisan Partner",
                role=role,
                village_pincode="141001",
                is_verified=True,
            )
            if password:
                user.set_password(password)
            user.save()

            if role == CustomUser.Role.FARMER:
                FarmerProfile.objects.create(
                    user=user,
                    farm_acreage=12.5,
                    soil_type="Alluvial Clay Loam",
                    irrigation_type="Canal + Drip",
                    kisan_card_number_last4="8812",
                )
            elif role == CustomUser.Role.MERCHANT:
                MerchantProfile.objects.create(
                    user=user,
                    company_name="AgriTrade Commercial",
                    apmc_license_no=f"APMC-{user.phone[-4:]}",
                    gst_number_last4="4421",
                    credit_limit=500000.00,
                )

        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["full_name"] = user.full_name

        return Response(
            {
                "status": "success",
                "message": "Authentication successful",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
