# mitiempo_django/turnos/views.py
from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Servicios, Turnos, TurnosXServicios
from .serializers import ServicioSerializer, TurnosXServiciosSerializer, TurnosSerializer


# 🔹 Permite ver sin autenticación, pero restringe edición a staff
class ReadOnlyOrAdminPermission(permissions.BasePermission):
    """
    Permite acceso de solo lectura a cualquiera,
    pero solo los usuarios staff pueden modificar.
    """
    def has_permission(self, request, view):
        # Métodos solo lectura (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Métodos de escritura (POST, PUT, PATCH, DELETE)
        return request.user and request.user.is_staff


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicios.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    permission_classes = [ReadOnlyOrAdminPermission]

    def get_queryset(self):
        user = self.request.user
        # Si es cliente o usuario anónimo, solo ve los servicios activos
        if not user.is_authenticated or (hasattr(user, 'role') and user.role == 'cliente'):
            return Servicios.objects.filter(activado=True)
        # Si es admin o empleado (staff), ve todos
        return Servicios.objects.all()


class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turnos.objects.all().select_related('id_cli')
    serializer_class = TurnosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(id_cli=self.request.user)


class TurnosXServicosViewSet(viewsets.ModelViewSet):
    queryset = TurnosXServicios.objects.all().select_related('id_turno', 'id_serv')
    serializer_class = TurnosXServiciosSerializer
    permission_classes = [permissions.IsAuthenticated]
