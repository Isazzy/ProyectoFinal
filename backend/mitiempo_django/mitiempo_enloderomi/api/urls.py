from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterAPIView, UserViewSet, CustomLoginView, listar_profesionales

router = DefaultRouter()
router.register(r'', UserViewSet, basename='usuarios')  # genera /api/usuarios/

urlpatterns = [
    # Registro de usuarios (clientes)
    path("register/", RegisterAPIView.as_view(), name="register"),

    # Endpoint público de profesionales
    path("profesionales/", listar_profesionales, name="profesionales"),

    # CRUD y acciones del ViewSet (admin)
    path("", include(router.urls)),
]
