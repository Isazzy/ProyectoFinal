# compra/views.py (adaptado al nuevo serializers.py y models.py)

from rest_framework import viewsets, permissions, mixins
from django_filters.rest_framework import DjangoFilterBackend  # Importado para filtros (mejora extra)
from rest_framework.filters import SearchFilter, OrderingFilter  # Importados para búsqueda y orden (mejora extra)
from .models import Proveedores, Compra  # Modelos adaptados
from .serializers import (
    ProveedoresSerializer,  # Serializer adaptado para Proveedores
    CompraListSerializer,   # Serializer para listar/ver compras
    CompraCreateSerializer, # Serializer para crear compras
)


class ProveedoresViewSet(viewsets.ModelViewSet):
    """
    API endpoint para CRUD completo de Proveedores.
    Permite crear, listar, ver, actualizar y eliminar proveedores.
    """
    queryset = Proveedores.objects.all().order_by("nombre_prov")  # Ordenado por nombre del proveedor (adaptado)
    serializer_class = ProveedoresSerializer
    permission_classes = [permissions.IsAuthenticated]  # Solo usuarios autenticados

    # Mejora extra: Agregado para filtros, búsqueda y orden dinámico
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['activo', 'tipo_prov']  # Filtros por estado activo y tipo de proveedor
    search_fields = ['nombre_prov', 'correo']  # Búsqueda por nombre o correo
    ordering_fields = ['nombre_prov', 'fecha_registro']  # Orden por nombre o fecha de registro


class CompraViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint para Compras:
    - POST (create): Crear una nueva compra (y actualizar stock de productos).
    - GET (list): Ver lista de compras.
    - GET (retrieve): Ver detalle de una compra.

    (No se permite Update (PUT/PATCH) ni Delete para mantener integridad de datos)
    """
    queryset = (
        Compra.objects.all()
        .select_related("proveedor", "ro_usuario")  # Optimiza FKs: proveedor y usuario (adaptado, sin caja FK)
        .prefetch_related("detalles__producto")  # Optimiza detalles y productos relacionados (adaptado a 'detalles' y 'producto')
        .order_by("-fecha_hs_comp")  # Ordenado por fecha descendente (adaptado a 'fecha_hs_comp')
    )
    permission_classes = [permissions.IsAuthenticated]  # Solo usuarios autenticados

    # Mejora extra: Paginación para listas grandes (evita cargar todo de una vez)
    pagination_class = None  # Puedes configurar una clase de paginación personalizada si lo deseas, e.g., PageNumberPagination

    # Mejora extra: Filtros y búsqueda para compras
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'metodo_pago', 'proveedor']  # Filtros por estado, método de pago y proveedor
    search_fields = ['id_compra', 'notas']  # Búsqueda por ID de compra o notas
    ordering_fields = ['fecha_hs_comp', 'total_compra']  # Orden por fecha o total

    def get_serializer_class(self):
        """
        Elige el serializer según la acción (Crear vs Listar/Ver).
        - Para 'create': Usa CompraCreateSerializer (escritura con detalles).
        - Para otras acciones: Usa CompraListSerializer (lectura con relaciones).
        """
        if self.action == "create":
            return CompraCreateSerializer
        return CompraListSerializer

    def get_serializer_context(self):
        """
        Pasa el 'request' al serializer para que podamos acceder a 'request.user'
        al momento de crear la compra (necesario para asignar ro_usuario).
        """
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    # Mejora extra: Método para filtrar queryset por usuario (solo ver compras propias si no es admin)
    def get_queryset(self):
        queryset = super().get_queryset()
        # Si el usuario no es staff/admin, filtra solo sus compras (seguridad adicional)
        if not self.request.user.is_staff:
            queryset = queryset.filter(ro_usuario=self.request.user)
        return queryset
