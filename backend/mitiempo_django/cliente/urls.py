from django.urls import path
from .views import (ClienteListCreateView, ClienteDetailView, ClienteRegisterView,
password_reset_request, password_reset_confirm,)

urlpatterns = [
    path('clientes/', ClienteListCreateView.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteDetailView.as_view(), name='cliente-detail'),
    path('register/', ClienteRegisterView.as_view(), name='cliente-register'),


    # Rutas de password reset ← NUEVAS
    path('password-reset/', password_reset_request, name='password-reset-request'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', password_reset_confirm, name='password-reset-confirm'),
]
