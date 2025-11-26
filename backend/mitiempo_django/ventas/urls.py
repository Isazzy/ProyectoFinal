from django.urls import path
from .views import (
    VentaListCreateView,
    VentaDetailView,
    EstadoVentaListView,
    resumen_ventas,
    stats_ingresos,
    dashboard_kpis
)

urlpatterns = [
    # Venta CRUD
    path('ventas/', VentaListCreateView.as_view(), name='venta-list'),
    path('ventas/<int:pk>/', VentaDetailView.as_view(), name='venta-detail'),

    # Estado de venta
    path('estados-venta/', EstadoVentaListView.as_view(), name='estado-venta-list'),

    # --- ENDPOINTS DE DASHBOARD ---
    path('resumen/', resumen_ventas, name='ventas-resumen'),
    path('stats/ingresos/', stats_ingresos, name='stats-ingresos'),
    path('dashboard/kpis/', dashboard_kpis, name='dashboard-kpis'),
]
