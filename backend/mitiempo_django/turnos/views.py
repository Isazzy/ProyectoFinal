# turnos/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db.models import Q
from datetime import timedelta, datetime, time

from .models import Turno, ConfiguracionLocal
from .serializers import (
    TurnoListSerializer,
    TurnoDetailSerializer,
    TurnoCreateSerializer,
    TurnoUpdateSerializer,
)
from servicio.models import Servicio


# --- Función auxiliar para día de la semana (ES)
def get_dia_semana_es(fecha):
    dias = {
        'Monday': 'lunes', 'Tuesday': 'martes', 'Wednesday': 'miercoles',
        'Thursday': 'jueves', 'Friday': 'viernes', 'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    return dias.get(fecha.strftime('%A'), '').lower()


# -------------------------
# Horarios disponibles
# -------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def horarios_disponibles(request):
    """
    Query params:
      - fecha=YYYY-MM-DD
      - servicios_ids=1,2,3
    Retorna: {'disponibilidad': ['09:00','09:30',...], 'mensaje': ''}
    """
    fecha_str = request.query_params.get('fecha')
    servicios_ids_str = request.query_params.get('servicios_ids')

    if not fecha_str or not servicios_ids_str:
        return Response({'error': 'Faltan parámetros: fecha y servicios_ids son requeridos.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        fecha = parse_date(fecha_str)
        if fecha is None:
            raise ValueError("Formato de fecha inválido.")
        hoy = timezone.localdate()
        if fecha < hoy:
            return Response({'disponibilidad': [], 'mensaje': 'No se pueden reservar turnos en fechas pasadas.'})
        servicios_ids = [int(sid) for sid in servicios_ids_str.split(',') if sid.strip()]
        if not servicios_ids:
            raise ValueError("La lista de servicios no puede estar vacía.")
    except (ValueError, TypeError) as e:
        return Response({'error': f"Parámetros inválidos: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    dia_semana_str = get_dia_semana_es(fecha)

    # obtener servicios y duración total requerida
    servicios_qs = Servicio.objects.filter(id_serv__in=servicios_ids, activado=True)
    if servicios_qs.count() != len(set(servicios_ids)):
        return Response({'error': 'Alguno de los servicios no existe o está inactivo.'}, status=status.HTTP_404_NOT_FOUND)

    duracion_total_minutos = sum(getattr(s, 'duracion_minutos', 30) for s in servicios_qs)
    duracion_necesaria = timedelta(minutes=duracion_total_minutos or 30)

    # Config del local
    config = ConfiguracionLocal.objects.first()
    if not config:
        return Response({'error': 'No se ha configurado el horario del local.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    dias_abiertos = [d.lower().strip() for d in config.dias_abiertos]
    if dia_semana_str not in dias_abiertos:
        return Response({'disponibilidad': [], 'mensaje': f'El local está cerrado los días {dia_semana_str}.'})

    # construir inicio/fin jornada aware
    try:
        apertura_time = config.hora_apertura
        cierre_time = config.hora_cierre

        # combinar fecha con horarios y hacer aware con timezone actual
        tz = timezone.get_current_timezone()
        inicio_jornada = timezone.make_aware(datetime.combine(fecha, apertura_time), timezone=tz)
        fin_jornada = timezone.make_aware(datetime.combine(fecha, cierre_time), timezone=tz)
        INTERVALO_PASO = timedelta(minutes=(config.tiempo_intervalo or 30))
    except Exception as e:
        return Response({'error': f'Error al procesar horario laboral: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # obtener turnos ocupados (pendiente o confirmado) en ese día
    turnos_ocupados_qs = Turno.objects.filter(
        fecha_hora_inicio__date=fecha,
        estado__in=['pendiente', 'confirmado']
    ).prefetch_related('servicios_asignados__servicio').order_by('fecha_hora_inicio')

    bloqueos = []
    for t in turnos_ocupados_qs:
        inicio = t.fecha_hora_inicio
        # calcular duración real del turno
        dur_turno = timedelta(
            minutes=sum(getattr(sa.servicio, 'duracion_minutos', 30) for sa in t.servicios_asignados.all())
        )
        fin = inicio + dur_turno
        bloqueos.append((inicio, fin))

    # helper: si hay cualquier solapamiento -> bloqueado
    def esta_bloqueado(start_slot, end_slot):
        for inicio_b, fin_b in bloqueos:
            if inicio_b < end_slot and fin_b > start_slot:
                return True
        return False

    # generar slots
    slots_disponibles = []
    now = timezone.now()
    slot = inicio_jornada
    while slot + duracion_necesaria <= fin_jornada:
        end_slot = slot + duracion_necesaria

        # bloquear si ya pasó (si es hoy)
        if slot.date() == now.date() and slot <= now:
            slot += INTERVALO_PASO
            continue

        # bloquear si solapa con algún turno
        if not esta_bloqueado(slot, end_slot):
            slots_disponibles.append(slot.strftime('%H:%M'))

        slot += INTERVALO_PASO

    mensaje = "" if slots_disponibles else "No hay horarios disponibles."
    return Response({'disponibilidad': slots_disponibles, 'mensaje': mensaje})

# --- ViewSet de Turnos ---
class TurnosViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Turnos.
    - Clientes ven solo sus turnos y pueden crear para sí mismos.
    - Empleados/Administradores pueden ver/crear/editar todos.
    """
    queryset = Turno.objects.all().order_by('fecha_hora_inicio')
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Turno.objects.select_related('cliente').prefetch_related('servicios_asignados__servicio').order_by('fecha_hora_inicio')

        if not user.is_authenticated:
            return qs.none()

        if user.groups.filter(name='Cliente').exists():
            # si el cliente es usuario, filter por user (tu Turno.cliente apunta a AUTH_USER_MODEL)
            return qs.filter(cliente=user)
        elif user.groups.filter(name__in=['Empleado', 'Administrador']).exists() or user.is_staff:
            return qs
        return qs.none()

    def get_serializer_class(self):
        if self.action in ['create']:
            return TurnoCreateSerializer
        if self.action in ['partial_update', 'update']:
            return TurnoUpdateSerializer
        if self.action in ['retrieve']:
            return TurnoDetailSerializer
        return TurnoListSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        request = self.request
        user = request.user

        # si es cliente, forzar cliente = request.user
        if user.groups.filter(name='Cliente').exists() and not (user.is_staff or user.groups.filter(name__in=['Empleado','Administrador']).exists()):
            serializer.save(cliente=user)
            return

        # si es empleado/administrador: permitir pasar 'cliente' en payload (serializer lo acepta)
        if not hasattr(user, 'empleado'):
            raise serializer.ValidationError("El usuario no está asociado a un perfil de empleado.")
        serializer.save()

    # Accion para solicitar cancelacion -> marcar cancelado
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def solicitar_cancelacion(self, request, pk=None):
        turno = self.get_object()
        if turno.estado not in ['pendiente', 'confirmado']:
            return Response({'error': 'No se puede solicitar cancelación de este turno.'}, status=status.HTTP_400_BAD_REQUEST)

        # Marcamos como cancelado (tu modelo no tiene solicitud intermedia)
        turno.estado = 'cancelado'
        turno.save()
        return Response({'status': 'Turno marcado como cancelado.'}, status=status.HTTP_200_OK)

