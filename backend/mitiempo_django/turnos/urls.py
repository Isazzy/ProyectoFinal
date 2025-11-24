from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurnosViewSet, horarios_disponibles

router = DefaultRouter()
# CORRECCIÓN: Usamos r'' para que no duplique el prefijo /turnos/turnos/
router.register(r'', TurnosViewSet, basename='turnos')

urlpatterns = [
    # Endpoint extra (ANTES del router para evitar conflictos con IDs)
    # URL Final: /api/turnos/horarios-disponibles/
    path('horarios-disponibles/', horarios_disponibles, name='horarios-disponibles'),

    # ViewSet (CRUD completo)
    # URL Final: /api/turnos/
    path('', include(router.urls)),
]