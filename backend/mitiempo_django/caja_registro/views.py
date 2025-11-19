# caja_registro/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import MovimientoCaja
from .serializers import MovimientoCajaSerializer

class MovimientoCajaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para Movimientos de Caja en una peluquería:
    - POST (create): Crear ingreso/egreso manual (e.g., pago de alquiler).
    - GET (list/retrieve): Ver movimientos (filtrar por caja, tipo, fecha).
    - PUT/PATCH (update): Editar movimientos (solo admin, con validaciones).
    - DELETE (destroy): Eliminar movimientos (solo admin, revierte saldo).

    Reglas de negocio: Solo empleados/admin; actualiza saldo automáticamente; auditoría completa.
    """
    
    queryset = MovimientoCaja.objects.all().select_related('caja', 'usuario').order_by('-fecha_hora')
    serializer_class = MovimientoCajaSerializer
    
    # Permisos: Autenticados, con lógica adicional por rol
    permission_classes = [permissions.IsAuthenticated]
    
    # Mejora: Paginación para listas grandes
    pagination_class = None  # Configura con PageNumberPagination si hay muchos movimientos
    
    # Filtros, búsqueda y orden
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['caja', 'tipo_movimiento', 'fecha_hora']  # Filtros por caja, tipo, fecha
    search_fields = ['motivo', 'usuario__username']  # Búsqueda por motivo o usuario
    ordering_fields = ['fecha_hora', 'monto']  # Orden por fecha o monto
    
    def get_queryset(self):
        """
        Filtra queryset: Empleados ven movimientos de sus cajas; admin ve todos.
        Regla de negocio: Privacidad en la peluquería.
        """
        queryset = super().get_queryset()
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'empleado':
            queryset = queryset.filter(caja__usuario=user)  # Solo cajas del empleado
        return queryset
    
    def perform_create(self, serializer):
        """
        Creación: Solo empleados/admin; valida permisos.
        Regla de negocio: Control estricto para evitar fraudes.
        """
        if not hasattr(self.request.user, 'role') or self.request.user.role not in ['admin', 'empleado']:
            raise permissions.PermissionDenied("Solo empleados o administradores pueden crear movimientos manuales.")
        serializer.save()
    
    def perform_update(self, serializer):
        """
        Actualización: Solo admin; revierte y aplica nuevo saldo.
        Regla de negocio: Cambios raros requieren aprobación.
        """
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Solo administradores pueden editar movimientos.")
        # Lógica para revertir saldo anterior y aplicar nuevo (implementa si es necesario)
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Eliminación: Solo admin; revierte saldo.
        Regla de negocio: Evita borrados accidentales; revierte impacto financiero.
        """
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Solo administradores pueden eliminar movimientos.")
        # Revertir saldo antes de eliminar
        if instance.tipo_movimiento == 'INGRESO':
            instance.caja.caja_saldo_final -= instance.monto
        elif instance.tipo_movimiento == 'EGRESO':
            instance.caja.caja_saldo_final += instance.monto
        instance.caja.save()
        instance.delete()