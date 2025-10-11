#mitiempo_django/turnos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, TurnosViewSet, TurnosXServicosViewSet


router = DefaultRouter()
router.register(r'servicios', ServicioViewSet, basename='servicios')
router.register(r'turnos', TurnosViewSet, basename='turnos')
router.register(r'turnosxservicios', TurnosXServicosViewSet, basename='turnosxservicios')

urlpatterns = [
    path('', include(router.urls)),
]