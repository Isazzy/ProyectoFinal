# caja_registro/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovimientoCajaViewSet
router = DefaultRouter()
router.register(r'movimientos', MovimientoCajaViewSet)
urlpatterns = [
    path('', include(router.urls)),
]