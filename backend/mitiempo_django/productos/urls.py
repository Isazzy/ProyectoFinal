# productos/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, ProveedorViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')

urlpatterns = router.urls
