from django.urls import path
from .views import (
    ProductoListCreateView, 
    ProductoDetailView, 
    TipoProductoListCreateView,
    TipoProductoDetailView,
    InsumoListCreateView,       # ¡Importamos las vistas de Insumo!
    InsumoDetailView,
    CategoriaInsumoListCreateView, # ¡Importamos las vistas de Categoría!
    CategoriaInsumoDetailView,
    movimiento_stock,
    MarcaListCreateView,
    MarcaDetailView,
    alertas_stock
)

urlpatterns = [
    # --- Rutas de Productos y Tipos ---
    path('productos/', ProductoListCreateView.as_view(), name='producto-list-create'),
    path('productos/<int:pk>/', ProductoDetailView.as_view(), name='producto-detail'),
    path('tipos-producto/', TipoProductoListCreateView.as_view(), name='tipo-producto-list-create'),
    path('tipos-producto/<int:pk>/', TipoProductoDetailView.as_view(), name='tipo-producto-detail'),

    # --- ¡NUEVAS RUTAS PARA INSUMOS! ---
    path('insumos/', InsumoListCreateView.as_view(), name='insumo-list-create'),
    path('insumos/<int:pk>/', InsumoDetailView.as_view(), name='insumo-detail'),
    path('insumos/<int:pk>/movimiento/', movimiento_stock, name='insumo-movimiento'),
    # --- ¡RUTAS PARA CATEGORÍAS DE INSUMOS CORREGIDAS! ---
    path('categorias-insumo/', CategoriaInsumoListCreateView.as_view(), name='categoriainsumo-list-create'),
    path('categorias-insumo/<int:pk>/', CategoriaInsumoDetailView.as_view(), name='categoriainsumo-detail'),
    path('marcas/', MarcaListCreateView.as_view(), name='marca-list-create'),
    path('marcas/<int:pk>/', MarcaDetailView.as_view(), name='marca-detail'),
    path('alertas/', alertas_stock, name='alertas-stock'),
]

