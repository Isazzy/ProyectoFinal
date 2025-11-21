from django.urls import path
from .views import ClienteListCreateView, ClienteDetailView, ClienteRegisterView

urlpatterns = [
    path('clientes/', ClienteListCreateView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente-detail'),

    # Registro público que crea User + Cliente (frontend usa este endpoint)
    path('register/', ClienteRegisterView.as_view(), name='cliente-register'),
]
