from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone

from .models import Venta, Estado_Venta
from .serializers import (
    VentaListSerializer,
    VentaCreateSerializer,
    VentaUpdateSerializer, # Ahora sí lo encontrará
    EstadoVentaSerializer
)

class VentaListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Venta.objects.select_related(
            "cliente", "empleado__user", "caja", "turno", "estado_venta"
        ).prefetch_related(
            "detalle_venta_set__producto", 
            "detalle_venta_servicio_set__servicio"
        ).order_by("-venta_fecha_hora")
        
        fecha = self.request.query_params.get('fecha')
        if fecha:
            qs = qs.filter(venta_fecha_hora__date=fecha)
            
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return VentaCreateSerializer
        return VentaListSerializer


class VentaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Venta.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return VentaUpdateSerializer
        return VentaListSerializer


class EstadoVentaListView(generics.ListAPIView):
    queryset = Estado_Venta.objects.all().order_by("id")
    serializer_class = EstadoVentaSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
def resumen_ventas(request):
    hoy = timezone.now().date()
    mes_actual = hoy.month
    anio_actual = hoy.year
    
    total_hoy = Venta.objects.filter(
        venta_fecha_hora__date=hoy,
        estado_venta__estado_venta_nombre='Pagado'
    ).aggregate(Sum('venta_total'))['venta_total__sum'] or 0

    total_mes = Venta.objects.filter(
        venta_fecha_hora__year=anio_actual,
        venta_fecha_hora__month=mes_actual,
        estado_venta__estado_venta_nombre='Pagado'
    ).aggregate(Sum('venta_total'))['venta_total__sum'] or 0

    return Response({
        "hoy": total_hoy,
        "mes": total_mes,
        "semana": 0
    })