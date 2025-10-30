<<<<<<< HEAD
# turnos/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, time, timedelta

from .models import Turno
from .serializers import TurnoSerializer
from servicio.models import Servicio

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def horarios_disponibles(request):
    """
    Calcula los slots de horarios disponibles para un profesional,
    una fecha y una lista de servicios específicos.
    """
    
    # 1. Obtener parámetros de la query
    try:
        profesional_id = int(request.query_params.get('id_prof'))
        fecha_str = request.query_params.get('fecha') # "YYYY-MM-DD"
        servicios_ids_str = request.query_params.get('servicios_ids') # "1,2,3"
        
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        servicios_ids = [int(sid) for sid in servicios_ids_str.split(',') if sid]
    except Exception as e:
        return Response(
            {'error': f"Parámetros inválidos: {e}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if not all([profesional_id, fecha, servicios_ids]):
        return Response(
            {'error': 'Faltan parámetros: id_prof, fecha y servicios_ids son requeridos.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2. Calcular duración total necesaria
    try:
        profesional = User.objects.get(id=profesional_id)
        servicios = Servicio.objects.filter(id_serv__in=servicios_ids)
        duracion_necesaria = sum(
            [s.duracion_serv for s in servicios if s.duracion_serv], 
            timedelta()
        )
        if duracion_necesaria == timedelta():
            duracion_necesaria = timedelta(minutes=30) # Default
            
    except User.DoesNotExist:
        return Response({'error': 'Profesional no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
         return Response({'error': f'Error al calcular duración: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    # 3. Obtener horario laboral del profesional para ese día
    try:
        dia_semana_turno = fecha.strftime("%A").lower()
        # Normalización (simple)
        if 'lunes' in dia_semana_turno: dia_nombre = 'lunes'
        elif 'martes' in dia_semana_turno: dia_nombre = 'martes'
        elif 'miércoles' in dia_semana_turno: dia_nombre = 'miércoles'
        elif 'jueves' in dia_semana_turno: dia_nombre = 'jueves'
        elif 'viernes' in dia_semana_turno: dia_nombre = 'viernes'
        elif 'sábado' in dia_semana_turno: dia_nombre = 'sábado'
        elif 'domingo' in dia_semana_turno: dia_nombre = 'domingo'
        else: dia_nombre = ''
        
        horario_profesional = next(
            (d for d in profesional.dias_laborables or [] if d.get('dia', '').lower() == dia_nombre), 
            None
        )
        
        if not horario_profesional:
            return Response({'disponibilidad': [], 'error': 'El profesional no trabaja ese día.'})

        tz = timezone.get_current_timezone()
        hora_inicio_laboral = datetime.strptime(horario_profesional.get('inicio', '09:00'), '%H:%M').time()
        hora_fin_laboral = datetime.strptime(horario_profesional.get('fin', '17:00'), '%H:%M').time()
        
        inicio_jornada = tz.localize(datetime.combine(fecha, hora_inicio_laboral))
        fin_jornada = tz.localize(datetime.combine(fecha, hora_fin_laboral))

    except Exception as e:
        return Response({'error': f'Error al procesar horario laboral: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 4. Obtener "obstáculos" (turnos ya reservados)
    turnos_ocupados = Turno.objects.filter(
        profesional=profesional,
        estado_turno__in=['pendiente', 'confirmado'],
        fecha_hora_inicio__date=fecha
    ).order_by('fecha_hora_inicio')

    # 5. Algoritmo de generación de slots (GAPs)
    slots_disponibles = []
    INTERVALO_PASO = timedelta(minutes=15) # El turno puede empezar cada 15 min
    
    # Empezamos en el inicio de la jornada
    slot_potencial = inicio_jornada
    
    # Ajustar si el día es hoy, para no mostrar slots pasados
    ahora = timezone.now()
    if slot_potencial < ahora:
        slot_potencial = ahora
        # Redondeamos al próximo intervalo (ej: 10:01 -> 10:15)
        minutos_pasados = slot_potencial.minute % INTERVALO_PASO.total_seconds() / 60
        if minutos_pasados > 0:
             slot_potencial += INTERVALO_PASO - timedelta(minutes=minutos_pasados)
        slot_potencial = slot_potencial.replace(second=0, microsecond=0)


    for turno in turnos_ocupados:
        # 'gap_fin' es el inicio del turno ocupado
        gap_fin = turno.fecha_hora_inicio 
        
        # Iteramos en el "gap" (espacio libre) antes de este turno
        while slot_potencial + duracion_necesaria <= gap_fin:
            slots_disponibles.append(slot_potencial.strftime('%H:%M'))
            slot_potencial += INTERVALO_PASO
            
        # Saltamos al final del turno ocupado para buscar el próximo gap
        slot_potencial = max(slot_potencial, turno.fecha_hora_fin)

    # 6. Revisar el último "gap" (desde el último turno hasta el fin de jornada)
    while slot_potencial + duracion_necesaria <= fin_jornada:
        slots_disponibles.append(slot_potencial.strftime('%H:%M'))
        slot_potencial += INTERVALO_PASO

    return Response({'disponibilidad': slots_disponibles})


class TurnosViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y gestionar Turnos.
    La lógica de creación y validación está en TurnoSerializer.
    """
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer
    permission_classes = [permissions.IsAuthenticated] # Requiere autenticación

    def get_queryset(self):
        """ Filtra los turnos según el rol del usuario """
        user = self.request.user
        qs = Turno.objects.all().select_related('cliente', 'profesional').prefetch_related('servicios_incluidos__servicio')

        if getattr(user, 'role', '') == 'cliente':
            return qs.filter(cliente=user)
        
        if getattr(user, 'role', '') == 'empleado':
            return qs.filter(profesional=user)
        
        # Admin ve todo
        return qs

    def get_serializer_context(self):
        """ Pasa el 'request' al serializer para que pueda acceder al usuario """
        return {'request': self.request}

    # No necesitas perform_create, el serializer se encarga de todo
    # (ya asigna el cliente desde el context['request'].user)
=======
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Turno, ConfiguracionLocal
from .serializers import TurnoSerializer
from servicio.models import Servicio


# --- Función auxiliar ---
def get_dia_semana_es(fecha):
    dias = {
        'Monday': 'lunes', 'Tuesday': 'martes', 'Wednesday': 'miercoles',
        'Thursday': 'jueves', 'Friday': 'viernes', 'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    return dias.get(fecha.strftime('%A'), '').lower()


# --- API: horarios disponibles ---
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def horarios_disponibles(request):
    fecha_str = request.query_params.get('fecha')
    servicios_ids_str = request.query_params.get('servicios_ids')

    if not all([fecha_str, servicios_ids_str]):
        return Response(
            {'error': 'Faltan parámetros: fecha y servicios_ids son requeridos.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Parseo ---
    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        servicios_ids = [int(sid) for sid in servicios_ids_str.split(',') if sid]
        if not servicios_ids:
            raise ValueError("La lista de servicios no puede estar vacía.")
    except (ValueError, TypeError) as e:
        return Response({'error': f"Parámetros inválidos: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    dia_semana_str = get_dia_semana_es(fecha)

    # --- Servicios ---
    try:
        servicios = Servicio.objects.filter(pk__in=servicios_ids, activado=True)
        if not servicios.exists():
            return Response({'error': 'Ninguno de los servicios solicitados fue encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        duracion_total_minutos = sum(getattr(s, 'duracion_minutos', 30) for s in servicios)
        duracion_necesaria = timedelta(minutes=duracion_total_minutos or 30)
    except Exception as e:
        return Response({'error': f'Error al calcular duración: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    # --- Configuración local ---
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

    # --- Turnos ocupados ---
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
            if timezone.is_naive(inicio):
                inicio = inicio.replace(tzinfo=tz)
            if timezone.is_naive(fin):
                fin = fin.replace(tzinfo=tz)
            bloqueos.append((inicio, fin))
    except Exception as e:
        return Response({'error': f'Error al obtener turnos ocupados: {e}'}, status=500)

    # --- Slots disponibles ---
    try:
        slots_disponibles = []
        slot_potencial = max(datetime.now(tz), inicio_jornada)

        for inicio_bloqueo, fin_bloqueo in bloqueos:
            while slot_potencial + duracion_necesaria <= inicio_bloqueo:
                slots_disponibles.append(slot_potencial.strftime('%H:%M'))
                slot_potencial += INTERVALO_PASO
            slot_potencial = max(slot_potencial, fin_bloqueo)

        while slot_potencial + duracion_necesaria <= fin_jornada:
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
        role = getattr(user, 'role', '').lower()

        if role == 'cliente':
            return qs.filter(cliente=user)
        elif role == 'empleado':
            # Empleado puede ver todos los turnos (pendientes, confirmados, cancelados)
            return qs
        elif role == 'admin':
            return qs
        return qs.none()

    def get_serializer_context(self):
        return {'request': self.request}
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
