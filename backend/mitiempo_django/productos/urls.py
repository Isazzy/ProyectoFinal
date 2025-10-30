# productos/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductosViewSet, MarcaViewSet, CategoriaViewSet

# Creamos un router de DRF
router = DefaultRouter()

# Registramos nuestras vistas. DRF crea las URLs automáticamente
# ej: /productos/, /productos/1/, /marcas/, /categorias/
router.register(r'', ProductosViewSet, basename='producto')
router.register(r'marcas', MarcaViewSet, basename='marca')
router.register(r'categorias', CategoriaViewSet, basename='categoria')

# Las URLs de la API son generadas por el router
urlpatterns = [
    path('', include(router.urls)),
]