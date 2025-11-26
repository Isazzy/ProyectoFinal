from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import timedelta, datetime
from .models import Turno, ConfiguracionLocal
from .serializers import (
    TurnoListSerializer, TurnoDetailSerializer,
    TurnoCreateSerializer, TurnoUpdateSerializer
)
from servicio.models import Servicio


# ======================================================
# DISPONIBILIDAD DE HORARIOS (TU CÓDIGO ORIGINAL)
# ======================================================
def get_dia_semana_es(fecha):
    mapa = {
        'Monday': 'lunes',
        'Tuesday': 'martes',
        'Wednesday': 'miercoles',
        'Thursday': 'jueves',
        'Friday': 'viernes',
        'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    return mapa.get(fecha.strftime('%A'), '').lower()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def horarios_disponibles(request):
    fecha_str = request.query_params.get('fecha')
    s_ids_str = request.query_params.get('servicios_ids')

    if not fecha_str or not s_ids_str:
        return Response({'error': 'Faltan parámetros'}, status=400)

    try:
        fecha = parse_date(fecha_str)
        s_ids = [int(x) for x in s_ids_str.split(',') if x.strip()]
    except:
        return Response({'error': 'Datos inválidos'}, status=400)

    servicios = Servicio.objects.filter(id_serv__in=s_ids, activo=True)
    if servicios.count() != len(set(s_ids)):
        return Response({'error': 'Servicios inválidos'}, status=404)

    total_min = sum(s.duracion for s in servicios)
    duracion_td = timedelta(minutes=total_min)

    config = ConfiguracionLocal.objects.first()
    if not config:
        return Response({'error': 'Sin configuración del local'}, status=500)

    dia = get_dia_semana_es(fecha)
    if dia not in config.dias_abiertos:
        return Response({
            'horarios': [],
            'disponibilidad': [],
            'mensaje': f"Cerrado los {dia}."
        })

    tz = timezone.get_current_timezone()
    inicio = timezone.make_aware(datetime.combine(fecha, config.hora_apertura), tz)
    fin = timezone.make_aware(datetime.combine(fecha, config.hora_cierre), tz)
    paso = timedelta(minutes=config.tiempo_intervalo)

    ocupados = Turno.objects.filter(
        fecha_hora_inicio__date=fecha,
        estado__in=['pendiente', 'confirmado']
    ).prefetch_related('servicios_asignados')

    bloqueos = []
    for t in ocupados:
        start = t.fecha_hora_inicio
        dur = sum(ts.duracion_servicio for ts in t.servicios_asignados.all())
        bloqueos.append((start, start + timedelta(minutes=dur)))

    horarios = []
    horas_disponibles = []
    now = timezone.now()
    curr = inicio

    while curr + duracion_td <= fin:
        hora_str = curr.strftime("%H:%M")
        estado = "disponible"

        if curr.date() == now.date() and curr <= now:
            estado = "pasado"

        for b_start, b_end in bloqueos:
            if b_start < curr + duracion_td and b_end > curr:
                estado = "ocupado"
                break

        if estado == "disponible":
            horas_disponibles.append(hora_str)

        horarios.append({
            "hora": hora_str,
            "estado": estado
        })

        curr += paso

    return Response({
        'horarios': horarios,
        'disponibilidad': horas_disponibles,
        'mensaje': ''
    })


# ======================================================
# VIEWSET PRINCIPAL — AHORA CON PAGO
# ======================================================
class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all().order_by('fecha_hora_inicio')
    permission_classes = [permissions.IsAuthenticated]

    # ----------------------------
    # FILTROS PARA ADMIN
    # ----------------------------
    def get_queryset(self):
        user = self.request.user
        qs = Turno.objects.select_related(
            'cliente'
        ).prefetch_related(
            'servicios_asignados__servicio'
        ).order_by('fecha_hora_inicio')

        if not user.is_authenticated:
            return qs.none()

        if user.groups.filter(name='Cliente').exists():
            return qs.filter(cliente=user)

        # FILTRO: turnos con comprobante pendiente
        if self.request.query_params.get("pendiente_pago") == "1":
            return qs.filter(comprobante_pago__isnull=False, estado_pago="seña")

        return qs

    # ----------------------------
    # SERIALIZER SEGÚN ACCIÓN
    # ----------------------------
    def get_serializer_class(self):
        if self.action == 'create':
            return TurnoCreateSerializer
        if self.action in ['update', 'partial_update']:
            return TurnoUpdateSerializer
        if self.action == 'retrieve':
            return TurnoDetailSerializer
        return TurnoListSerializer

    # ----------------------------
    # CREAR TURNO
    # ----------------------------
    def perform_create(self, serializer):
        user = self.request.user
        if user.groups.filter(name='Cliente').exists() and not user.is_staff:
            serializer.save(cliente=user)
        else:
            serializer.save()

    # ----------------------------
    # CANCELAR
    # ----------------------------
    @action(detail=True, methods=['post'])
    def solicitar_cancelacion(self, request, pk=None):
        t = self.get_object()
        if t.estado not in ['pendiente', 'confirmado']:
            return Response(status=400)

        t.estado = 'cancelado'
        t.save()
        return Response({'status': 'ok'})

    # ======================================================
    # SUBIR COMPROBANTE
    # ======================================================
    @action(detail=True, methods=['post'])
    def subir_comprobante(self, request, pk=None):
        turno = self.get_object()

        archivo = request.FILES.get('comprobante')
        estado_pago = request.data.get('estado_pago', 'seña')

        if not archivo:
            return Response({"error": "No se envió ningún archivo."},
                            status=status.HTTP_400_BAD_REQUEST)

        turno.comprobante_pago = archivo
        turno.estado_pago = estado_pago
        turno.fecha_pago = timezone.now()
        turno.save()

        return Response({
            "mensaje": "Comprobante recibido.",
            "estado_pago": turno.estado_pago,
            "fecha_pago": turno.fecha_pago,
            "comprobante_url": turno.comprobante_pago.url if turno.comprobante_pago else None,
        })

    # ======================================================
    # ACEPTAR PAGO
    # ======================================================
    @action(detail=True, methods=['post'])
    def aceptar_pago(self, request, pk=None):
        turno = self.get_object()

        turno.estado_pago = "pagado"
        turno.estado = "confirmado"  # 🔥 confirmación automática
        turno.fecha_pago = timezone.now()
        turno.save()

        return Response({
            "mensaje": "Pago aceptado",
            "estado_pago": turno.estado_pago,
            "estado": turno.estado,
            "fecha_pago": turno.fecha_pago
        })

    # ======================================================
    # RECHAZAR PAGO
    # ======================================================
    @action(detail=True, methods=['post'])
    def rechazar_pago(self, request, pk=None):
        turno = self.get_object()

        turno.estado_pago = "no_pagado"
        turno.comprobante_pago = None
        turno.save()

        return Response({
            "mensaje": "Pago rechazado",
            "estado_pago": turno.estado_pago,
            "comprobante": None
        })
