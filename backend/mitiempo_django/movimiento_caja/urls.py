from django.urls import path
from .views import (
    IngresoCreateListView, 
    EgresoCreateListView, 
    MovimientoConsolidadoListView # Importar la nueva vista
)

urlpatterns = [
    # Ruta Raíz: Lista consolidada de TODO
    # GET /api/movimiento-caja/?caja_id=2
    path('', MovimientoConsolidadoListView.as_view(), name='movimiento-consolidado'),

    # Rutas específicas para crear
    # POST /api/movimiento-caja/ingresos/
    path('ingresos/', IngresoCreateListView.as_view(), name='ingreso-list-create'),

    # POST /api/movimiento-caja/egresos/
    path('egresos/', EgresoCreateListView.as_view(), name='egreso-list-create'),
]