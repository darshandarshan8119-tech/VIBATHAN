from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from users.models import CustomUser, FarmerProfile, MerchantProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("phone", "full_name", "role", "is_verified", "is_staff", "last_login")
    list_filter = ("role", "is_verified", "is_staff", "is_superuser")
    search_fields = ("phone", "email", "full_name")
    ordering = ("phone",)
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Profile", {"fields": ("full_name", "email", "role", "village_pincode", "is_verified")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("phone", "full_name", "role", "password1", "password2")}),
    )


admin.site.register(FarmerProfile)
admin.site.register(MerchantProfile)
