# venta/views.py

from rest_framework import viewsets, permissions, mixins
from django_filters.rest_framework import DjangoFilterBackend  # Para filtros avanzados
from rest_framework.filters import SearchFilter, OrderingFilter  # Para búsqueda y orden
from .models import Ventas, DetVentas  # Modelos de ventas y detalles
from .serializers import (
    VentasCreateSerializer,  # Serializer para crear ventas
    VentasListSerializer,    # Serializer para listar/ver ventas
)


class VentasViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint para Ventas en una peluquería:
    - POST (create): Crear una nueva venta (con detalles de productos/servicios, actualizar stock y calcular totales).
    - GET (list): Ver lista de ventas.
    - GET (retrieve): Ver detalle de una venta específica.

    (No se permite Update (PUT/PATCH) ni Delete para mantener integridad de datos y evitar modificaciones post-venta)
    """
    
    # Queryset optimizado: carga relaciones para eficiencia (cliente, caja) y detalles con prefetch
    queryset = (
        Ventas.objects.all()
        .select_related("cliente", "id_caja")  # Optimiza FKs a cliente y caja
        .prefetch_related("detventas_set__id_prod", "detventas_set__id_serv")  # Optimiza detalles con productos/servicios
        .order_by("-fech_hs_vent")  # Ordena por fecha descendente (más recientes primero)
    )
    
    # Permisos: solo usuarios autenticados (puedes cambiar a IsAdminUser si es necesario)
    permission_classes = [permissions.IsAuthenticated]
    
    # Mejora: Paginación para listas grandes (configúrala con PageNumberPagination si hay muchas ventas)
    pagination_class = None  # Placeholder; activa si necesitas paginar
    
    # Mejora: Filtros, búsqueda y orden dinámico para facilitar consultas
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tipo_venta', 'tipo_pago', 'cliente', 'id_caja']  # Filtros por tipo de venta, pago, cliente o caja
    search_fields = ['id_venta', 'cliente__email']  # Búsqueda por ID de venta o email del cliente
    ordering_fields = ['fech_hs_vent', 'total_venta']  # Orden por fecha o total
    
    def get_serializer_class(self):
        """
        Elige el serializer según la acción del request:
        - Para 'create' (POST): Usa VentasCreateSerializer (maneja escritura con detalles anidados y validaciones).
        - Para 'list' o 'retrieve' (GET): Usa VentasListSerializer (lectura con relaciones legibles).
        Esto separa lógica de escritura (con cálculos y actualizaciones) de lectura (solo mostrar datos).
        """
        if self.action == "create":
            return VentasCreateSerializer
        return VentasListSerializer
    
    def get_serializer_context(self):
        """
        Agrega el 'request' al contexto del serializer.
        Esto permite que VentasCreateSerializer acceda a request.user para validaciones (e.g., usuario autenticado).
        Es crucial para la lógica de creación, ya que valida autenticación y caja abierta.
        """
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
    def get_queryset(self):
        """
        Filtra el queryset dinámicamente:
        - Si el usuario no es staff/admin, muestra solo ventas donde el cliente es el usuario actual (seguridad para clientes).
        - De lo contrario, muestra todas las ventas (para empleados/admin).
        Mejora la privacidad: clientes solo ven sus propias ventas; empleados ven todas.
        """
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(cliente=self.request.user)
        return queryset


# Nota: No incluí un ViewSet para DetVentas porque los detalles se manejan anidados en VentasViewSet.
# Si necesitas CRUD separado para detalles (e.g., para ediciones individuales), puedes agregar uno similar a ProveedoresViewSet.
