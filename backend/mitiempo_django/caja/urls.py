from django.urls import path
from .views import (
    CajaHistoryView, 
    CajaStatusView, 
    AbrirCajaView, 
    CerrarCajaView
)

urlpatterns = [
    # GET /api/caja/historial/ (Ver todas las cajas)
    path('historial/', CajaHistoryView.as_view(), name='caja-historial'),
    
    # GET /api/caja/estado/ (Ver si hay una caja abierta)
    path('estado/', CajaStatusView.as_view(), name='caja-estado'),
    
    # POST /api/caja/abrir/ (Abrir la caja)
    path('abrir/', AbrirCajaView.as_view(), name='caja-abrir'),
    
    # PATCH /api/caja/cerrar/ (Cerrar la caja abierta)
    path('cerrar/', CerrarCajaView.as_view(), name='caja-cerrar'),
]