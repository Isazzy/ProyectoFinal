from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Turno, ConfiguracionLocal
from .serializers import TurnoSerializer
from servicio.models import Servicio

# --- Función auxiliar para día de la semana ---
def get_dia_semana_es(fecha):
    dias = {
        'Monday': 'lunes', 'Tuesday': 'martes', 'Wednesday': 'miercoles',
        'Thursday': 'jueves', 'Friday': 'viernes', 'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    return dias.get(fecha.strftime('%A'), '').lower()


# --- API: horarios disponibles ---
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def horarios_disponibles(request):
    fecha_str = request.query_params.get('fecha')
    servicios_ids_str = request.query_params.get('servicios_ids')

    if not all([fecha_str, servicios_ids_str]):
        return Response({'error': 'Faltan parámetros: fecha y servicios_ids son requeridos.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        if fecha < timezone.now().date():
            return Response({'disponibilidad': [], 'mensaje': 'No se pueden reservar turnos en fechas pasadas.'})
        servicios_ids = [int(sid) for sid in servicios_ids_str.split(',') if sid]
        if not servicios_ids:
            raise ValueError("La lista de servicios no puede estar vacía.")
    except (ValueError, TypeError) as e:
        return Response({'error': f"Parámetros inválidos: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    dia_semana_str = get_dia_semana_es(fecha)

    try:
        servicios = Servicio.objects.filter(pk__in=servicios_ids, activado=True)
        if not servicios.exists():
            return Response({'error': 'Ninguno de los servicios solicitados fue encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        duracion_total_minutos = sum(getattr(s, 'duracion_minutos', 30) for s in servicios)
        duracion_necesaria = timedelta(minutes=duracion_total_minutos or 30)
    except Exception as e:
        return Response({'error': f'Error al calcular duración: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        config = ConfiguracionLocal.objects.first()
        if not config:
            raise ConfiguracionLocal.DoesNotExist
        dias_abiertos = [d.lower().strip() for d in config.dias_abiertos]
        if dia_semana_str not in dias_abiertos:
            return Response({'disponibilidad': [], 'mensaje': f'El local está cerrado los días {dia_semana_str}.'})
        tz = timezone.get_current_timezone()
        inicio_jornada = datetime.combine(fecha, config.hora_apertura).replace(tzinfo=tz)
        fin_jornada = datetime.combine(fecha, config.hora_cierre).replace(tzinfo=tz)
        INTERVALO_PASO = timedelta(minutes=config.tiempo_intervalo or 30)
    except ConfiguracionLocal.DoesNotExist:
        return Response({'error': 'No se ha configurado el horario del local.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'Error al procesar horario laboral: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        turnos_ocupados_qs = Turno.objects.filter(
            fecha_hora_inicio__date=fecha,
            estado__in=['pendiente', 'confirmado']
        ).prefetch_related('servicios_asignados__servicio').order_by('fecha_hora_inicio')

        bloqueos = []
        for t in turnos_ocupados_qs:
            inicio = t.fecha_hora_inicio
            duracion_total_turno = timedelta(
                minutes=sum(getattr(sa.servicio, 'duracion_minutos', 30) for sa in t.servicios_asignados.all())
            )
            fin = inicio + duracion_total_turno
            bloqueos.append((inicio, fin, t.cliente_id))
    except Exception as e:
        return Response({'error': f'Error al obtener turnos ocupados: {e}'}, status=500)

    def clientes_en_slot(inicio_slot, fin_slot):
        clientes = set()
        for inicio_b, fin_b, cliente_id in bloqueos:
            if inicio_b < fin_slot and fin_b > inicio_slot:
                clientes.add(cliente_id)
        return len(clientes)

    try:
        slots_disponibles = []
        slot_potencial = inicio_jornada

        while slot_potencial + duracion_necesaria <= fin_jornada:
            fin_slot = slot_potencial + duracion_necesaria
            if fecha == timezone.now().date() and slot_potencial < timezone.now():
                slot_potencial += INTERVALO_PASO
                continue
            if clientes_en_slot(slot_potencial, fin_slot) < 2:
                slots_disponibles.append(slot_potencial.strftime('%H:%M'))
            slot_potencial += INTERVALO_PASO

        mensaje = "" if slots_disponibles else "No hay horarios disponibles."
        return Response({'disponibilidad': slots_disponibles, 'mensaje': mensaje})
    except Exception as e:
        return Response({'error': f'Error al generar horarios: {e}'}, status=500)


# --- ViewSet de Turnos ---
class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all().order_by('fecha_hora_inicio')
    serializer_class = TurnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Turno.objects.all().select_related('cliente').prefetch_related('servicios_asignados__servicio')

        if not user.is_authenticated:
            return qs.none()

        if user.groups.filter(name='Cliente').exists():
            return qs.filter(cliente=user)
        elif user.groups.filter(name__in=['Empleado', 'Administrador']).exists():
            return qs

        return qs.none()

    def get_serializer_context(self):
        return {'request': self.request}

    # --- Nueva acción: solicitar cancelación ---
    @action(detail=True, methods=['post'])
    def solicitar_cancelacion(self, request, pk=None):
        turno = self.get_object()
        if turno.estado not in ['pendiente', 'confirmado']:
            return Response({'error': 'No se puede solicitar cancelación de este turno.'},
                            status=status.HTTP_400_BAD_REQUEST)
        turno.estado = 'solicitud_cancelada'
        turno.save()
        return Response({'status': 'Solicitud de cancelación enviada correctamente.'})
