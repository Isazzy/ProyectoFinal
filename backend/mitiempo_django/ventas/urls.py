# ========================================
# backend/mitiempo_django/ventas/urls.py
# URLs actualizadas con endpoint de Ingresos/Egresos
# ========================================
from django.urls import path
from .views import (
    VentaListCreateView,
    VentaDetailView,
    EstadoVentaListView,
    resumen_ventas,
    stats_ingresos,
    stats_ingresos_egresos,  # NUEVO
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
    path('stats/ingresos-egresos/', stats_ingresos_egresos, name='stats-ingresos-egresos'),  # NUEVO
    path('dashboard/kpis/', dashboard_kpis, name='dashboard-kpis'),
]