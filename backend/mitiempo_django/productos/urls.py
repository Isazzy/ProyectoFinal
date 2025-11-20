# productos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views import ProductoViewSet, ProveedorViewSet
=======
from .views import ProductosViewSet, MarcaViewSet, CategoriaViewSet
>>>>>>> 874e3164 (reestructuracion de archivos)

# Creamos un router de DRF
router = DefaultRouter()
<<<<<<< HEAD
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')

urlpatterns = router.urls
=======

# Registramos nuestras vistas. DRF crea las URLs automáticamente
# ej: /productos/, /productos/1/, /marcas/, /categorias/
router.register(r'', ProductosViewSet, basename='producto')
router.register(r'marcas', MarcaViewSet, basename='marca')
router.register(r'categorias', CategoriaViewSet, basename='categoria')

# Las URLs de la API son generadas por el router
urlpatterns = [
    path('', include(router.urls)),
]
>>>>>>> 874e3164 (reestructuracion de archivos)
