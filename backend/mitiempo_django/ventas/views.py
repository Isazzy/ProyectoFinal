# ========================================
# backend/mitiempo_django/ventas/views.py
# Vistas actualizadas con endpoint de Ingresos/Egresos
# ========================================
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import datetime, time, timedelta
from decimal import Decimal

# Modelos
from .models import Venta, Estado_Venta, Detalle_Venta, Detalle_Venta_Servicio
from compras.models import Compra
from movimiento_caja.models import Ingreso, Egreso

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
                inicio_dia = datetime.combine(fecha, time.min)
                fin_dia = datetime.combine(fecha, time.max)

                # 3. Hacemos que las fechas sean "conscientes" (Aware) de la zona horaria
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
    hoy = timezone.localtime(timezone.now()).date()
    mes_actual = hoy.month
    anio_actual = hoy.year
    
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
    """Estadísticas de ingresos por servicios vs productos"""
    dias_param = request.query_params.get('dias', 90)
    try:
        dias = int(dias_param)
    except ValueError:
        dias = 90

    fecha_limite = timezone.now() - timedelta(days=dias)

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
        if f not in data_map: 
            data_map[f] = {'date': f, 'servicios': 0, 'productos': 0}
        data_map[f]['servicios'] = s['total']

    for p in productos:
        f = p['fecha'].strftime("%Y-%m-%d")
        if f not in data_map: 
            data_map[f] = {'date': f, 'servicios': 0, 'productos': 0}
        data_map[f]['productos'] = p['total']

    chart_data = sorted(data_map.values(), key=lambda x: x['date'])
    
    return Response(chart_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stats_ingresos_egresos(request):
    """
    NUEVO ENDPOINT: Ingresos vs Egresos por día
    Retorna: [{ date, ingresos, egresos }, ...]
    """
    dias_param = request.query_params.get('dias', 30)
    try:
        dias = int(dias_param)
    except ValueError:
        dias = 30

    fecha_limite = timezone.now() - timedelta(days=dias)

    # 1. INGRESOS: Ventas Pagadas + Ingresos Manuales
    ventas_diarias = Venta.objects.filter(
        venta_fecha_hora__gte=fecha_limite,
        estado_venta__estado_venta_nombre='Pagado'
    ).annotate(
        fecha=TruncDate('venta_fecha_hora')
    ).values('fecha').annotate(
        total=Sum('venta_total')
    )

    ingresos_manuales = Ingreso.objects.filter(
        ingreso_fecha__gte=fecha_limite.date()
    ).values('ingreso_fecha').annotate(
        total=Sum('ingreso_monto')
    )

    # 2. EGRESOS: Compras + Egresos Manuales
    compras_diarias = Compra.objects.filter(
        compra_fecha__gte=fecha_limite.date()
    ).values('compra_fecha').annotate(
        total=Sum('compra_total')
    )

    egresos_manuales = Egreso.objects.filter(
        egreso_fecha__gte=fecha_limite.date()
    ).values('egreso_fecha').annotate(
        total=Sum('egreso_monto')
    )

    # 3. Consolidar en un diccionario
    data_map = {}

    for v in ventas_diarias:
        f = v['fecha'].strftime("%Y-%m-%d")
        if f not in data_map:
            data_map[f] = {'date': f, 'ingresos': Decimal(0), 'egresos': Decimal(0)}
        data_map[f]['ingresos'] += v['total'] or Decimal(0)

    for i in ingresos_manuales:
        f = i['ingreso_fecha'].strftime("%Y-%m-%d")
        if f not in data_map:
            data_map[f] = {'date': f, 'ingresos': Decimal(0), 'egresos': Decimal(0)}
        data_map[f]['ingresos'] += i['total'] or Decimal(0)

    for c in compras_diarias:
        f = c['compra_fecha'].strftime("%Y-%m-%d")
        if f not in data_map:
            data_map[f] = {'date': f, 'ingresos': Decimal(0), 'egresos': Decimal(0)}
        data_map[f]['egresos'] += c['total'] or Decimal(0)

    for e in egresos_manuales:
        f = e['egreso_fecha'].strftime("%Y-%m-%d")
        if f not in data_map:
            data_map[f] = {'date': f, 'ingresos': Decimal(0), 'egresos': Decimal(0)}
        data_map[f]['egresos'] += e['total'] or Decimal(0)

    # 4. Ordenar y retornar
    chart_data = sorted(data_map.values(), key=lambda x: x['date'])
    
    return Response(chart_data)


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

    # Transformar a dict para facilitar acceso
    desglose_dict = {
        'efectivo': Decimal(0),
        'transferencia': Decimal(0)
    }
    
    for p in pagos_desglose:
        metodo = p['venta_medio_pago']
        if metodo in desglose_dict:
            desglose_dict[metodo] = p['total']

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
            "desglose_pagos": desglose_dict
        },
        "ranking": {
            "servicios": list(top_servicios),
            "productos": list(top_productos)
        }
    })