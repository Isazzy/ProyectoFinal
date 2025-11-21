from django.urls import path
from .views import (
    VentaListCreateView,
    VentaDetailView,
    EstadoVentaListView
)

urlpatterns = [
    # GET /api/venta/ventas/ (Para la lista)
    path('ventas/', VentaListCreateView.as_view(), name='venta-list'),
    
    # GET, PUT, PATCH /api/venta/ventas/<id>/ (Para actualizar)
    path('ventas/<int:pk>/', VentaDetailView.as_view(), name='venta-detail'),
    
    # GET /api/venta/estados-venta/ (Para el dropdown del modal)
    path('estados-venta/', EstadoVentaListView.as_view(), name='estado-venta-list'),
]