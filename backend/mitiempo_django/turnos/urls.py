from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServicioViewSet,
    TurnosViewSet,
    TurnosXServicosViewSet,
    horarios_disponibles
)

# 🔁 Router principal para los ViewSets REST
router = DefaultRouter()

# 🗓️ Gestión de turnos
router.register(r'turnos', TurnosViewSet, basename='turnos')

# 🧰 Gestión de servicios
router.register(r'servicios', ServicioViewSet, basename='servicios')

# 🔗 Relación entre turnos y servicios
router.register(r'turnosxservicios', TurnosXServicosViewSet, basename='turnosxservicios')

# 📅 Consulta de horarios disponibles
urlpatterns = [
    path('horarios_disponibles/', horarios_disponibles, name='horarios_disponibles'),
    path('', include(router.urls)),  # incluye todos los endpoints del router
]