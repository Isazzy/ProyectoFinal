from rest_framework import generics, permissions, serializers
from rest_framework.response import Response

from .models import Venta, Estado_Venta
from .serializers import (
    VentaListSerializer,
    VentaCreateSerializer,
    VentaUpdateSerializer,
    EstadoVentaSerializer
)

from caja.models import Caja


# ---------------------------------------------------------
#   LIST & CREATE
# ---------------------------------------------------------
class VentaListCreateView(generics.ListCreateAPIView):
    queryset = (
        Venta.objects
        .select_related("cliente", "empleado__user", "caja", "turno", "estado_venta")
        .prefetch_related("detalle_venta_set__producto", "detalle_venta_servicio_set__servicio")
        .order_by("-venta_fecha_hora")
    )

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return VentaCreateSerializer
        return VentaListSerializer


# ---------------------------------------------------------
#   DETALLE / UPDATE / DELETE
# ---------------------------------------------------------
class VentaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Venta.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return VentaUpdateSerializer
        return VentaListSerializer


# ---------------------------------------------------------
#   LISTA DE ESTADOS DE VENTA
# ---------------------------------------------------------
class EstadoVentaListView(generics.ListAPIView):
    queryset = Estado_Venta.objects.all().order_by("id")
    serializer_class = EstadoVentaSerializer
    permission_classes = [permissions.IsAuthenticated]
