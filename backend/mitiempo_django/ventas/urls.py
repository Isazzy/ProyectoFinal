from django.urls import path
from .views import (
    VentaListCreateView,
    VentaDetailView,
    EstadoVentaListView,
    resumen_ventas,
    stats_ingresos
)

urlpatterns = [
    # Lista y Crear: /api/ventas/ventas/
    path('ventas/', VentaListCreateView.as_view(), name='venta-list'),
    
    # Detalle, Editar, Anular: /api/ventas/ventas/<id>/
    path('ventas/<int:pk>/', VentaDetailView.as_view(), name='venta-detail'),
    
    # Estados: /api/ventas/estados-venta/
    path('estados-venta/', EstadoVentaListView.as_view(), name='estado-venta-list'),
    
    # Resumen: /api/ventas/resumen/
    path('resumen/', resumen_ventas, name='venta-resumen'),
    
    path('stats/ingresos/', stats_ingresos, name='venta-stats-ingresos'),
]