from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import CurrentUserView, RegisterView, UnifiedLoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", UnifiedLoginView.as_view(), name="auth-login"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
