# servicios/urls.py
<<<<<<< HEAD
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet

router = DefaultRouter()
router.register(r'servicios', ServicioViewSet, basename='servicios')

urlpatterns = [
    path('', include(router.urls)),
]
=======
from django.urls import path
from .views import (
    ServicioListCreateView, ServicioDetailView, toggle_activo,
    ServicioInsumoListCreateView, ServicioInsumoDetailView,
    listar_insumos_disponibles, consumir_stock_manual
)

urlpatterns = [
    # Servicios
    path('servicios/', ServicioListCreateView.as_view(), name='servicio-list-create'),
    path('servicios/<int:pk>/', ServicioDetailView.as_view(), name='servicio-detail'),
    path('servicios/<int:pk>/activo/', toggle_activo, name='servicio-toggle-activo'),

    # Insumos por servicio
    path('servicio-insumos/', ServicioInsumoListCreateView.as_view(), name='servicio-insumo-list-create'),
    path('servicio-insumos/<int:pk>/', ServicioInsumoDetailView.as_view(), name='servicio-insumo-detail'),

    # Inventario / stock helpers
    path('insumos/disponibles/', listar_insumos_disponibles, name='insumos-disponibles'),
    path('insumos/consumir/', consumir_stock_manual, name='insumos-consumir'),
]
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
