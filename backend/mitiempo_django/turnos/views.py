<<<<<<< HEAD
<<<<<<< HEAD
# turnos/views.py
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, time, timedelta
from django.db.models import Sum

# Importamos los modelos nuevos y correctos
from .models import Turno, ConfiguracionLocal
from .serializers import TurnoSerializer
from servicio.models import Servicio

# --- Helper para normalizar días ---
def get_dia_semana_es(fecha):
    dias = {
        'Monday': 'lunes',
        'Tuesday': 'martes',
        'Wednesday': 'miercoles',
        'Thursday': 'jueves',
        'Friday': 'viernes',
        'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    return dias.get(fecha.strftime('%A'), '').lower()


@api_view(['GET'])
@permission_classes([AllowAny])
def horarios_disponibles(request):
    fecha_str = request.query_params.get('fecha') # "YYYY-MM-DD"
    servicios_ids_str = request.query_params.get('servicios_ids') # "1,2,3"

    if not all([fecha_str, servicios_ids_str]):
        return Response(
            {'error': 'Faltan parámetros: fecha y servicios_ids son requeridos.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        servicios_ids = [int(sid) for sid in servicios_ids_str.split(',') if sid]
        if not servicios_ids:
             raise ValueError("La lista de servicios no puede estar vacía.")
    except (ValueError, TypeError) as e:
        return Response(
            {'error': f"Parámetros inválidos: {e}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- 2. Calcular Duración Total Necesaria ---
    try:
        servicios = Servicio.objects.filter(pk__in=servicios_ids)
        if not servicios.exists():
            return Response({'error': 'Ninguno de los servicios solicitados fue encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        duracion_total_minutos = 0
        for s in servicios:
            # Reemplaza 'duracion_minutos' por el nombre real de tu campo de duración en Servicio
            if hasattr(s, 'duracion_minutos'):
                duracion_total_minutos += s.duracion_minutos
            elif hasattr(s, 'duracion'): # Fallback para DurationField
                duracion_total_minutos += int(s.duracion.total_seconds() / 60)
            else:
                duracion_total_minutos += 30 # Default si no tiene campo

        if duracion_total_minutos == 0:
            duracion_total_minutos = 30 # Default si la suma es 0
            
        duracion_necesaria = timedelta(minutes=duracion_total_minutos)
        
    except Exception as e:
       return Response({'error': f'Error al calcular duración: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    # --- 3. Obtener Horario General del Local ---
    try:
        config = ConfiguracionLocal.objects.first()
        if not config:
            raise ConfiguracionLocal.DoesNotExist
        
        dia_semana_str = get_dia_semana_es(fecha)
        
        # Validar si el local abre ese día
        dias_abiertos_normalizados = [dia.lower().strip() for dia in config.dias_abiertos]
        if dia_semana_str not in dias_abiertos_normalizados:
            return Response({'disponibilidad': [], 'mensaje': f'El local está cerrado los días {dia_semana_str}.'})

        # Definir la jornada laboral
        tz = timezone.get_current_timezone()
        inicio_jornada = tz.localize(datetime.combine(fecha, config.hora_apertura))
        fin_jornada = tz.localize(datetime.combine(fecha, config.hora_cierre))
        INTERVALO_PASO = timedelta(minutes=config.tiempo_intervalo)

    except ConfiguracionLocal.DoesNotExist:
        return Response({'error': 'Error crítico: No se ha configurado el horario del local.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'Error al procesar horario laboral: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    turnos_ocupados_qs = Turno.objects.filter(
        fecha_hora_inicio__date=fecha,
        estado__in=['pendiente', 'confirmado']
    ).prefetch_related('servicios_asignados').order_by('fecha_hora_inicio')
    bloqueos = []
    for turno in turnos_ocupados_qs:
        bloqueos.append((turno.fecha_hora_inicio, turno.fecha_hora_fin))
    slots_disponibles = []
    slot_potencial = inicio_jornada
    ahora = timezone.now()
    if slot_potencial < ahora:
        slot_potencial = ahora
        minutos_sobrantes = slot_potencial.minute % (INTERVALO_PASO.total_seconds() / 60)
        if minutos_sobrantes > 0:
             slot_potencial += (INTERVALO_PASO - timedelta(minutes=minutos_sobrantes))
        slot_potencial = slot_potencial.replace(second=0, microsecond=0)
    for inicio_bloqueo, fin_bloqueo in bloqueos:
        gap_fin = inicio_bloqueo
        while slot_potencial + duracion_necesaria <= gap_fin:
            slots_disponibles.append(slot_potencial.strftime('%H:%M'))
            slot_potencial += INTERVALO_PASO
        fin_bloqueo_rounded = fin_bloqueo
        minutos_sobrantes = fin_bloqueo.minute % (INTERVALO_PASO.total_seconds() / 60)
        if minutos_sobrantes > 0:
             fin_bloqueo_rounded += (INTERVALO_PASO - timedelta(minutes=minutos_sobrantes))
        fin_bloqueo_rounded = fin_bloqueo_rounded.replace(second=0, microsecond=0)
        
        slot_potencial = max(slot_potencial, fin_bloqueo_rounded)
    while slot_potencial + duracion_necesaria <= fin_jornada:
        slots_disponibles.append(slot_potencial.strftime('%H:%M'))
        slot_potencial += INTERVALO_PASO

    return Response({'disponibilidad': slots_disponibles})

class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
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

<<<<<<< HEAD
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
=======
    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
