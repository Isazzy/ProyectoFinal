from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
<<<<<<< HEAD
from .views import ProductoViewSet, ProveedorViewSet
=======
from .views import ProductosViewSet, MarcaViewSet, CategoriaViewSet
>>>>>>> 874e3164 (reestructuracion de archivos)
=======
from .views import (
    ProductosViewSet, 
    MarcaViewSet, 
    CategoriaViewSet, 
    StockHistoryViewSet
)
>>>>>>> 67ec8a26 (Producto terminado (Creo))

router = DefaultRouter()
<<<<<<< HEAD
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')

urlpatterns = router.urls
=======

# --- CAMBIO ---
# Rutas registradas correctamente con sus nombres base
router.register(r'productos', ProductosViewSet, basename='productos')
router.register(r'marcas', MarcaViewSet, basename='marcas')
router.register(r'categorias', CategoriaViewSet, basename='categorias')
# --- CAMBIO (AÑADIDO) ---
# Registro del ViewSet de historial de stock
router.register(r'stockhistory', StockHistoryViewSet, basename='stockhistory')

urlpatterns = [
    path('', include(router.urls)),
]
>>>>>>> 874e3164 (reestructuracion de archivos)
