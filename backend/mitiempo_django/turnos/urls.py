from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, TurnosViewSet, TurnosXServicosViewSet, horarios_disponibles

router = DefaultRouter()
router.register('servicios', ServicioViewSet)
router.register('turnos', TurnosViewSet)
router.register('turnos_x_servicios', TurnosXServicosViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('horarios_disponibles/', horarios_disponibles, name='horarios_disponibles'),
]
