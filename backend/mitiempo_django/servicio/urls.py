# servicios/urls.py
from django.urls import path
from .views import ServicioListCreateView, ServicioDetailView, toggle_activado

urlpatterns = [
    path('servicios/', ServicioListCreateView.as_view(), name='servicio-list-create'),
    path('servicios/<int:pk>/', ServicioDetailView.as_view(), name='servicio-detail'),
    path('servicios/<int:pk>/activado/', toggle_activado, name='servicio-toggle-activado'),
]
