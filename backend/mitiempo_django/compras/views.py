from rest_framework import viewsets, permissions, mixins
from .models import Proveedor, Compra
from .serializers import (
    ProveedorSerializer,
    CompraListSerializer,
    CompraCreateSerializer,
)


class ProveedorViewSet(viewsets.ModelViewSet):
    """
    API endpoint para CRUD completo de Proveedores.
    """

    queryset = Proveedor.objects.all().order_by("proveedor_nombre")
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]  # O [permissions.IsAdminUser]


class CompraViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint para Compras:
    - POST (create): Crear una nueva compra (y actualizar stock).
    - GET (list): Ver lista de compras.
    - GET (retrieve): Ver detalle de una compra.

    (No se permite Update (PUT/PATCH) ni Delete para mantener integridad)
    """

    queryset = (
        Compra.objects.all()
        .select_related("proveedor", "empleado__user", "caja")
        .prefetch_related("detalle_compra_set__insumo")  # Optimiza la carga de detalles
        .order_by("-compra_fecha_hora")
    )  # Más nuevas primero

    permission_classes = [permissions.IsAuthenticated]  # O [permissions.IsAdminUser]

    def get_serializer_class(self):
        """
        Elige el serializer según la acción (Crear vs Listar/Ver)
        """
        if self.action == "create":
            return CompraCreateSerializer
        return CompraListSerializer

    def get_serializer_context(self):
        """
        Pasa el 'request' al serializer para que podamos acceder a 'request.user'
        al momento de crear la compra.
        """
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
