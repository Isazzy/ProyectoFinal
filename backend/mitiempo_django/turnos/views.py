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