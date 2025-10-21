from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterAPIView, UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='usuarios')  # sin 'usuarios' aquí

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("", include(router.urls)),  # esto generará /api/usuarios/... correctamente
]
