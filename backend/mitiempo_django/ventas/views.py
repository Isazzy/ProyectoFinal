from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from .models import Detalle_Venta, Detalle_Venta_Servicio
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions



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

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stats_ingresos(request):
    """
    Devuelve los ingresos diarios separados por Servicios y Productos
    para el gráfico de áreas.
    """
    # Rango: Últimos 90 días por defecto
    dias = int(request.query_params.get('dias', 90))
    fecha_inicio = timezone.now().date() - timedelta(days=dias)

    # 1. Calcular totales de Servicios por día
    servicios = Detalle_Venta_Servicio.objects.filter(
        venta__venta_fecha_hora__date__gte=fecha_inicio,
        venta__estado_venta__estado_venta_nombre='Pagado'
    ).annotate(
        fecha=TruncDate('venta__venta_fecha_hora')
    ).values('fecha').annotate(
        total=Sum(F('precio') * F('cantidad') - F('descuento'))
    ).order_by('fecha')

    # 2. Calcular totales de Productos por día
    productos = Detalle_Venta.objects.filter(
        venta__venta_fecha_hora__date__gte=fecha_inicio,
        venta__estado_venta__estado_venta_nombre='Pagado'
    ).annotate(
        fecha=TruncDate('venta__venta_fecha_hora')
    ).values('fecha').annotate(
        total=Sum(F('detalle_venta_precio_unitario') * F('detalle_venta_cantidad') - F('detalle_venta_descuento'))
    ).order_by('fecha')

    # 3. Combinar datos en un diccionario por fecha
    data_map = {}

    for s in servicios:
        f = s['fecha'].strftime("%Y-%m-%d")
        if f not in data_map: data_map[f] = {'date': f, 'servicios': 0, 'productos': 0}
        data_map[f]['servicios'] = s['total']

    for p in productos:
        f = p['fecha'].strftime("%Y-%m-%d")
        if f not in data_map: data_map[f] = {'date': f, 'servicios': 0, 'productos': 0}
        data_map[f]['productos'] = p['total']

    # Convertir a lista ordenada
    chart_data = sorted(data_map.values(), key=lambda x: x['date'])
    
    return Response(chart_data)