from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterAPIView, UserViewSet, CustomLoginView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()

router.register('usuarios', UserViewSet, basename='usuarios')

urlpatterns = router.urls + [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),  
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
