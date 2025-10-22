# turnos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, TurnosViewSet, TurnosXServicosViewSet, horarios_disponibles

router = DefaultRouter()
router.register(r'', TurnosViewSet, basename='turnos')  # 
router.register(r'servicios', ServicioViewSet, basename='servicios')
router.register(r'turnosxservicios', TurnosXServicosViewSet, basename='turnosxservicios')

urlpatterns = [
    path('horarios_disponibles/', horarios_disponibles, name='horarios_disponibles'),
    path('', include(router.urls)),
]
