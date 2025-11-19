#compras/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProveedoresViewSet,
    CompraViewSet,
)

# Crear el router de DRF
router = DefaultRouter()

# Registrar los ViewSets
router.register(r'proveedores', ProveedoresViewSet, basename='proveedores')
router.register(r'compras', CompraViewSet, basename='compra')
#router.register(r'productos-proveedores', productos_x_proveedoresViewSet, basename='producto-proveedor')

# URLs de la app
urlpatterns = [
    path('', include(router.urls)),
]