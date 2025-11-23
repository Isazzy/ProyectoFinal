from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    EmpleadoListView,
    EmpleadoCreateByAdminView,
    EmpleadoDeleteView,
    EmpleadoUpdateView,
    RolListView,
    LoginView 
)

urlpatterns = [
    # Autenticación
    path('api/login/', LoginView.as_view(), name="token_obtain_pair"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Gestión de Empleados (CRUD Admin)
    # IMPORTANTE: Asegúrate de que el prefijo /api/empleado/ esté en el urls.py principal del proyecto
    # si este archivo se incluye allí. Si no, ajusta estas rutas.
    path('list/', EmpleadoListView.as_view(), name='empleado-list'),
    path('create/', EmpleadoCreateByAdminView.as_view(), name='empleado-create-by-admin'),
    path('delete/<int:pk>/', EmpleadoDeleteView.as_view(), name='empleado-delete'),
    path('update/<int:pk>/', EmpleadoUpdateView.as_view(), name='empleado-update'),

    # Roles
    path('roles/', RolListView.as_view(), name='rol-list'),
]