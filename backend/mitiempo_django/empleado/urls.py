from django.urls import path
from .views import (
    EmpleadoListView,
    EmpleadoCreateByAdminView,
    EmpleadoDeleteView,
    EmpleadoUpdateView,
    RolListView,
    MyTokenObtainPairView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # JWT (login por email) -> /api/empleado/token/
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Empleado CRUD (admin)
    path('list/', EmpleadoListView.as_view(), name='empleado-list'),
    path('create/', EmpleadoCreateByAdminView.as_view(), name='empleado-create-by-admin'),
    path('delete/<int:pk>/', EmpleadoDeleteView.as_view(), name='empleado-delete'),
    path('update/<int:pk>/', EmpleadoUpdateView.as_view(), name='empleado-update'),

    # Roles
    path('roles/', RolListView.as_view(), name='rol-list'),
]
