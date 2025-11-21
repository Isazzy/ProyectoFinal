# turnos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurnosViewSet, horarios_disponibles

router = DefaultRouter()
router.register(r'turnos', TurnosViewSet, basename='turnos')

urlpatterns = [
    # ViewSet (CRUD completo)
    path('', include(router.urls)),

    # Endpoint extra
    path('turnos/horarios-disponibles/', horarios_disponibles, name='horarios-disponibles'),
]
