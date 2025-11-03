from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductosViewSet, 
    MarcaViewSet, 
    CategoriaViewSet, 
    StockHistoryViewSet
)

router = DefaultRouter()

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