from django.urls import path
from .views import IngresoCreateListView, EgresoCreateListView

urlpatterns = [
    # GET, POST /api/movimiento_caja/ingresos/
    path('ingresos/', IngresoCreateListView.as_view(), name='ingreso-list-create'),
    
    # GET, POST /api/movimiento_caja/egresos/
    path('egresos/', EgresoCreateListView.as_view(), name='egreso-list-create'),
]