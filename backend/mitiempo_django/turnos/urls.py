from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurnosViewSet, horarios_disponibles

router = DefaultRouter()
# Configuración del router para el ViewSet de Turnos
# Usamos r'' para que las rutas sean /api/turnos/ y /api/turnos/{id}/
router.register(r'', TurnosViewSet, basename='turno')

urlpatterns = [
    # ⚠️ IMPORTANTE: Las rutas específicas deben ir ANTES del router.
    # Esto evita que Django interprete "disponibilidad" como si fuera un ID de turno.
    
    # URL Final: /api/turnos/disponibilidad/?fecha=...
    path('disponibilidad/', horarios_disponibles, name='horarios-disponibles'),
    
    # Rutas generadas por el router (List, Create, Retrieve, Update, Delete)
    path('', include(router.urls)),
]