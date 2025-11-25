from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProveedorViewSet, CompraViewSet

# Creamos un router para registrar automáticamente todas las rutas
router = DefaultRouter()
# Rutas para la gestión de proveedores: /api/compra/proveedores/
router.register(r'proveedores', ProveedorViewSet, basename='proveedor') 

# Rutas para la gestión de compras: /api/compra/compras/
router.register(r'compras', CompraViewSet, basename='compra')

# Exportamos las rutas generadas por el router
urlpatterns = router.urls
