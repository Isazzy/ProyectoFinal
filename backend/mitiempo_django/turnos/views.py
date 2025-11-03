from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Turno, ConfiguracionLocal
from .serializers import TurnoSerializer
from servicio.models import Servicio


# --- Función auxiliar para obtener día de la semana en español ---
def get_dia_semana_es(fecha):
    dias = {
        'Monday': 'lunes', 'Tuesday': 'martes', 'Wednesday': 'miercoles',
        'Thursday': 'jueves', 'Friday': 'viernes', 'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    return dias.get(fecha.strftime('%A'), '').lower()


# --- API: horarios disponibles ---
@api_view(['GET'])
@permission_classes([AllowAny])
def horarios_disponibles(request):
    fecha_str = request.query_params.get('fecha')
    servicios_ids_str = request.query_params.get('servicios_ids')

    if not all([fecha_str, servicios_ids_str]):
        return Response(
            {'error': 'Faltan parámetros: fecha y servicios_ids son requeridos.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Parseo de fecha y servicios ---
    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        servicios_ids = [int(sid) for sid in servicios_ids_str.split(',') if sid]
        if not servicios_ids:
            raise ValueError("La lista de servicios no puede estar vacía.")
    except (ValueError, TypeError) as e:
        return Response({'error': f"Parámetros inválidos: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    dia_semana_str = get_dia_semana_es(fecha)

    # --- Validar servicios y calcular duración total ---
    try:
        servicios = Servicio.objects.filter(pk__in=servicios_ids, activado=True)
        if not servicios.exists():
            return Response({'error': 'Ninguno de los servicios solicitados fue encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        duracion_total_minutos = 0
        for s in servicios:
            dias_servicio = [dia.lower().strip() for dia in s.dias_disponibles]
            if dia_semana_str not in dias_servicio:
                return Response({
                    'disponibilidad': [],
                    'mensaje': f'El servicio "{s.nombre_serv}" no se ofrece los días {dia_semana_str}.'
                }, status=status.HTTP_200_OK)

            duracion_total_minutos += getattr(s, 'duracion_minutos', 30)

        if duracion_total_minutos <= 0:
            duracion_total_minutos = 30

        duracion_necesaria = timedelta(minutes=duracion_total_minutos)
        
    except Exception as e:
        return Response({'error': f'Error al calcular duración: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    # --- Configuración del local ---
    try:
        config = ConfiguracionLocal.objects.first()
        if not config:
            raise ConfiguracionLocal.DoesNotExist

        dias_abiertos = [dia.lower().strip() for dia in config.dias_abiertos]
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

    # --- Obtener turnos ocupados ---
    try:
        turnos_ocupados_qs = Turno.objects.filter(
            fecha_hora_inicio__date=fecha,
            estado__in=['pendiente', 'confirmado']
        ).prefetch_related('servicios_asignados__servicio').order_by('fecha_hora_inicio')

        bloqueos = []
        for t in turnos_ocupados_qs:
            inicio = t.fecha_hora_inicio
            # Calcular duración del turno sumando duración de servicios asignados
            duracion_total_minutos_turno = sum(
                getattr(sa.servicio, 'duracion_minutos', 30) for sa in t.servicios_asignados.all()
            )
            duracion_total_turno = timedelta(minutes=duracion_total_minutos_turno)
            fin = inicio + duracion_total_turno if inicio else None

            if inicio and fin:
                if timezone.is_naive(inicio):
                    inicio = inicio.replace(tzinfo=tz)
                if timezone.is_naive(fin):
                    fin = fin.replace(tzinfo=tz)
                bloqueos.append((inicio, fin))
    except Exception as e:
        return Response({'error': f'Error al obtener turnos ocupados: {e}'}, status=500)

    # --- Generar slots disponibles ---
    try:
        slots_disponibles = []
        slot_potencial = inicio_jornada
        ahora = timezone.now()
        if slot_potencial < ahora:
            slot_potencial = ahora.replace(second=0, microsecond=0)
            # Redondear al próximo intervalo
            minutos_sobrantes = slot_potencial.minute % (INTERVALO_PASO.total_seconds() / 60)
            if minutos_sobrantes > 0:
                slot_potencial += (INTERVALO_PASO - timedelta(minutes=minutos_sobrantes))

        # Revisar bloqueos
        for inicio_bloqueo, fin_bloqueo in bloqueos:
            while slot_potencial + duracion_necesaria <= inicio_bloqueo:
                slots_disponibles.append(slot_potencial.strftime('%H:%M'))
                slot_potencial += INTERVALO_PASO
            slot_potencial = max(slot_potencial, fin_bloqueo)

        # Agregar slots después del último turno
        while slot_potencial + duracion_necesaria <= fin_jornada:
            slots_disponibles.append(slot_potencial.strftime('%H:%M'))
            slot_potencial += INTERVALO_PASO

        mensaje = "" if slots_disponibles else "No hay horarios disponibles."

        return Response({
            'disponibilidad': slots_disponibles,
            'mensaje': mensaje
        })

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
        if getattr(user, 'role', '') == 'cliente':
            return qs.filter(cliente=user)
        if user.is_staff or user.is_superuser:
            return qs
        return qs.none()

    def get_serializer_context(self):
        return {'request': self.request}
