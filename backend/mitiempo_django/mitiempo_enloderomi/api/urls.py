from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterAPIView, UserViewSet, CustomLoginView

router = DefaultRouter()
router.register(r'', UserViewSet, basename='usuarios')

urlpatterns = [
    path("login/", CustomLoginView.as_view(), name="login"),
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("", include(router.urls)),
]
