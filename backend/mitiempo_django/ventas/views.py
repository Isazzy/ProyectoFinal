from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import datetime, time, timedelta

# Modelos
from .models import Venta, Estado_Venta, Detalle_Venta, Detalle_Venta_Servicio

# Serializers
from .serializers import (
    VentaListSerializer,
    VentaCreateSerializer,
    VentaUpdateSerializer,
    EstadoVentaSerializer
)

# ---------------------------------------------------------
#   VISTAS GENÉRICAS (CRUD)
# ---------------------------------------------------------

class VentaListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Venta.objects.select_related(
            "cliente", "empleado__user", "caja", "turno", "estado_venta"
        ).prefetch_related(
            "detalle_venta_set__producto", 
            "detalle_venta_servicio_set__servicio"
        ).order_by("-venta_fecha_hora")
        
        # --- FILTRO DE FECHA CORREGIDO (SOLUCIÓN TIMEZONE) ---
        fecha_str = self.request.query_params.get('fecha')
        
        if fecha_str:
            # 1. Parseamos el string 'YYYY-MM-DD' a objeto date
            fecha = parse_date(fecha_str)
            
            if fecha:
                # 2. Creamos el rango de inicio (00:00) y fin (23:59:59.999)
                # Usamos la fecha combinada con la hora mínima y máxima
                inicio_dia = datetime.combine(fecha, time.min)
                fin_dia = datetime.combine(fecha, time.max)

                # 3. Hacemos que las fechas sean "conscientes" (Aware) de la zona horaria de Argentina
                # Django convertirá esto a UTC automáticamente al consultar la BD
                start_aware = timezone.make_aware(inicio_dia, timezone.get_current_timezone())
                end_aware = timezone.make_aware(fin_dia, timezone.get_current_timezone())

                # 4. Filtramos por rango exacto
                qs = qs.filter(venta_fecha_hora__range=(start_aware, end_aware))
            
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


# ---------------------------------------------------------
#   ENDPOINTS DE ESTADÍSTICAS
# ---------------------------------------------------------

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def resumen_ventas(request):
    # Usamos localtime para asegurar que 'hoy' sea hoy en Argentina, no en Londres (UTC)
    hoy = timezone.localtime(timezone.now()).date()
    mes_actual = hoy.month
    anio_actual = hoy.year
    
    # Para filtrar correctamente por __date en estadísticas, también es mejor usar rangos
    # pero __date suele funcionar si la DB tiene las timezones cargadas. 
    # Por seguridad usamos la misma lógica de rangos.
    
    inicio_hoy = timezone.make_aware(datetime.combine(hoy, time.min))
    fin_hoy = timezone.make_aware(datetime.combine(hoy, time.max))

    # Ventas de Hoy
    total_hoy = Venta.objects.filter(
        venta_fecha_hora__range=(inicio_hoy, fin_hoy),
        estado_venta__estado_venta_nombre='Pagado'
    ).aggregate(Sum('venta_total'))['venta_total__sum'] or 0

    # Ventas del Mes
    total_mes = Venta.objects.filter(
        venta_fecha_hora__year=anio_actual,
        venta_fecha_hora__month=mes_actual,
        estado_venta__estado_venta_nombre='Pagado'
    ).aggregate(Sum('venta_total'))['venta_total__sum'] or 0

    return Response({
        "hoy": total_hoy,
        "mes": total_mes
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stats_ingresos(request):
    # Rango: Últimos 90 días
    dias_param = request.query_params.get('dias', 90)
    try:
        dias = int(dias_param)
    except ValueError:
        dias = 90

    fecha_limite = timezone.now() - timedelta(days=dias)

    # Nota: TruncDate usa la timezone configurada en settings si USE_TZ=True
    
    servicios = Detalle_Venta_Servicio.objects.filter(
        venta__venta_fecha_hora__gte=fecha_limite,
        venta__estado_venta__estado_venta_nombre='Pagado'
    ).annotate(
        fecha=TruncDate('venta__venta_fecha_hora')
    ).values('fecha').annotate(
        total=Sum(F('precio') * F('cantidad') - F('descuento'))
    ).order_by('fecha')

    productos = Detalle_Venta.objects.filter(
        venta__venta_fecha_hora__gte=fecha_limite,
        venta__estado_venta__estado_venta_nombre='Pagado'
    ).annotate(
        fecha=TruncDate('venta__venta_fecha_hora')
    ).values('fecha').annotate(
        total=Sum(F('detalle_venta_precio_unitario') * F('detalle_venta_cantidad') - F('detalle_venta_descuento'))
    ).order_by('fecha')

    data_map = {}
    
    for s in servicios:
        f = s['fecha'].strftime("%Y-%m-%d")
        if f not in data_map: data_map[f] = {'date': f, 'servicios': 0, 'productos': 0}
        data_map[f]['servicios'] = s['total']

    for p in productos:
        f = p['fecha'].strftime("%Y-%m-%d")
        if f not in data_map: data_map[f] = {'date': f, 'servicios': 0, 'productos': 0}
        data_map[f]['productos'] = p['total']

    chart_data = sorted(data_map.values(), key=lambda x: x['date'])
    
    return Response(chart_data)


#################################
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_kpis(request):
    hoy = timezone.localtime(timezone.now()).date()
    inicio_mes = hoy.replace(day=1)
    
    # 1. Ventas del Mes Globales (Solo Pagadas)
    ventas_mes_qs = Venta.objects.filter(
        venta_fecha_hora__date__gte=inicio_mes,
        estado_venta__estado_venta_nombre='Pagado'
    )
    
    total_ingresos_mes = ventas_mes_qs.aggregate(Sum('venta_total'))['venta_total__sum'] or 0
    cantidad_ventas_mes = ventas_mes_qs.count()
    ticket_promedio = total_ingresos_mes / cantidad_ventas_mes if cantidad_ventas_mes > 0 else 0

    # 2. DESGLOSE: EFECTIVO VS TRANSFERENCIA
    pagos_desglose = ventas_mes_qs.values('venta_medio_pago').annotate(
        total=Sum('venta_total')
    )

    # Transformado al formato que tu frontend necesita
    desglose_lista = [
        {
            "metodoPago": p["venta_medio_pago"],
            "total": p["total"]
        }
        for p in pagos_desglose
    ]

    # 3. RANKINGS
    top_servicios = Detalle_Venta_Servicio.objects.filter(
        venta__in=ventas_mes_qs
    ).values('servicio__nombre').annotate(
        total_vendidos=Sum('cantidad')
    ).order_by('-total_vendidos')[:5]

    top_productos = Detalle_Venta.objects.filter(
        venta__in=ventas_mes_qs
    ).values('producto__producto_nombre').annotate(
        total_vendidos=Sum('detalle_venta_cantidad')
    ).order_by('-total_vendidos')[:5]

    return Response({
        "finanzas": {
            "ingresos_mes": total_ingresos_mes,
            "ventas_cantidad": cantidad_ventas_mes,
            "ticket_promedio": ticket_promedio,
            "desglose_pagos": desglose_lista  # ✔️ corregido
        },
        "ranking": {
            "servicios": list(top_servicios),
            "productos": list(top_productos)
        }
    })
