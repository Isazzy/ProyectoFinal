# turnos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TurnosViewSet,
    horarios_disponibles
)

router = DefaultRouter()
router.register(r'turnos', TurnosViewSet, basename='turnos')
# Ya no necesitamos TurnosXServicosViewSet, se maneja anidado en TurnoSerializer

urlpatterns = [
    # Endpoint para calcular disponibilidad
    path('horarios_disponibles/', horarios_disponibles, name='horarios_disponibles'),
    
    # Endpoints del ViewSet (CRUD de Turnos)
    path('', include(router.urls)),
]