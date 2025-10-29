from rest_framework import viewsets, permissions, status
from .models import Servicios, Turnos, TurnosXServicios
from .serializers import ServicioSerializer, TurnosSerializer, TurnosXServiciosSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import BasePermission, IsAuthenticated, IsAuthenticatedOrReadOnly
from datetime import timedelta, datetime, time, date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings
import pytz
import locale
import re 

User = get_user_model()
TIME_ZONE = getattr(settings, 'TIME_ZONE', 'UTC')

# --- NUEVA FUNCIÓN DE UTILIDAD: Normalización de nombres de días ---
def normalize_day_name(day_str):
    """Normaliza el nombre del día a minúsculas y sin tildes."""
    if not day_str:
        return ''
    s = day_str.lower().strip()
    s = s.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    return s.replace('ñ', 'n')

# --- Funciones auxiliares (calcular_duracion_total, obtener_rangos_ocupados) ---

def calcular_duracion_total(servicios_ids):
    """Calcula la duración total sumada de una lista de IDs de servicio."""
    try:
        servicios_objs = Servicios.objects.filter(pk__in=servicios_ids, activado=True) 
        if not servicios_objs.exists():
            raise serializers.ValidationError("No se encontraron servicios válidos o activos.")

        duracion_segundos = sum([s.duracion_serv.total_seconds() for s in servicios_objs if s.duracion_serv], 0)

        if duracion_segundos == 0:
            raise serializers.ValidationError("Al menos un servicio debe tener duración definida.")
            
        return timedelta(seconds=duracion_segundos), servicios_objs

    except Exception as e:
        raise serializers.ValidationError(f"Error al calcular la duración: {str(e)}")


def obtener_rangos_ocupados(profesional_id, fecha: date):
    """Obtiene una lista de tuplas (inicio, fin) de todos los turnos ocupados."""
    
    turnos = Turnos.objects.filter(
        id_prof_id=profesional_id, 
        fecha_turno=fecha, 
        estado_turno__in=['pendiente', 'confirmado']
    ).prefetch_related('servicios_incluidos')

    rangos_ocupados = []

    for t in turnos:
        duracion_segundos = sum([
            s.duracion_serv.total_seconds() 
            for s in t.servicios_incluidos.all() if s.duracion_serv
        ], 0)

        start_dt = datetime.combine(fecha, t.hora_turno, tzinfo=pytz.timezone(TIME_ZONE))
        end_dt = start_dt + timedelta(seconds=duracion_segundos)
        rangos_ocupados.append((start_dt, end_dt))
        
    return rangos_ocupados


# --- Endpoint de horarios disponibles (Ajustado) ---
@api_view(['GET'])
def horarios_disponibles(request):
    """
    Devuelve horarios disponibles, usando los horarios laborales REALES del profesional.
    """
    id_prof = request.query_params.get('id_prof')
    fecha_str = request.query_params.get('fecha')
    servicios_ids_str = request.query_params.get('servicios_ids')

    if not fecha_str or not servicios_ids_str:
        return Response({'error': 'Faltan parámetros: fecha y servicios_ids'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        servicios_ids = [int(x.strip()) for x in servicios_ids_str.split(',') if x.strip()]
        
        duracion_necesaria, _ = calcular_duracion_total(servicios_ids)
        
    except (ValueError, serializers.ValidationError) as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
    profesionales = User.objects.filter(role__in=['empleado', 'admin'], is_active=True)
    if id_prof:
        profesionales = profesionales.filter(id=id_prof)
    
    # ... (Configuración de locale) ...
    try:
        locale.setlocale(locale.LC_ALL, 'es_ES.UTF-8')
    except locale.Error:
        try: locale.setlocale(locale.LC_ALL, 'es_ES')
        except locale.Error: pass 

    system_day_name = fecha.strftime("%A")
    dia_nombre_normalizado = normalize_day_name(system_day_name)
    
    INTERVALO_PASO = timedelta(minutes=15)
    disponibles_por_profesional = {}
    
    for prof in profesionales:
        horario_dia = None
        
        # 1. Buscar el día y obtener el horario de inicio/fin
        for d in prof.dias_laborables or []:
            day_data = d if isinstance(d, dict) and 'dia' in d else {'dia': d, 'inicio': '09:00', 'fin': '17:00'}
            normalized_prof_day = normalize_day_name(day_data.get('dia', ''))

            if normalized_prof_day == dia_nombre_normalizado:
                horario_dia = day_data
                break
        
        if not horario_dia:
            continue
            
        try:
            HORA_INICIO_PROF = datetime.strptime(horario_dia.get('inicio', '09:00'), '%H:%M').time()
            HORA_FIN_PROF = datetime.strptime(horario_dia.get('fin', '17:00'), '%H:%M').time()
        except (TypeError, ValueError):
            continue 

        # 2. Obtener rangos ocupados
        rangos_ocupados = obtener_rangos_ocupados(prof.id, fecha)
        
        # 3. Buscar slots disponibles
        slots = []
        t = datetime.combine(fecha, HORA_INICIO_PROF, tzinfo=pytz.timezone(TIME_ZONE))
        fin_horario = datetime.combine(fecha, HORA_FIN_PROF, tzinfo=pytz.timezone(TIME_ZONE))

        while t + duracion_necesaria <= fin_horario:
            rango_turno = (t, t + duracion_necesaria)
            is_available = all(rango_turno[1] <= o[0] or rango_turno[0] >= o[1] for o in rangos_ocupados)
            
            if is_available:
                slots.append(t.strftime("%H:%M"))
            
            t += INTERVALO_PASO
            
        if slots:
            disponibles_por_profesional[prof.id] = {
                'id': prof.id,
                'nombre': prof.get_full_name() or prof.username,
                'profesion': prof.rol_profesional, 
                'slots': slots
            }

    return Response({'disponibilidad': disponibles_por_profesional})


# --- ViewSets ---

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicios.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or getattr(user, 'role', '') == 'cliente':
            return Servicios.objects.filter(activado=True)
        return Servicios.objects.all()


class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turnos.objects.all().select_related('id_cli', 'id_prof').prefetch_related('servicios_incluidos')
    serializer_class = TurnosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'cliente':
            return self.queryset.filter(id_cli=user)
        if getattr(user, 'role', '') == 'empleado':
            return self.queryset.filter(id_prof=user)
        return self.queryset

    def perform_create(self, serializer):
        
        try:
            id_cli = self.request.user 
            
            # El serializer validó 'id_prof', obtenemos el objeto User
            id_prof_obj = serializer.validated_data.get('id_prof') 
            
            fecha_turno = serializer.validated_data.get('fecha_turno')
            hora_turno = serializer.validated_data.get('hora_turno')
            
            # 'id_servicios' viene como una lista de objetos Servicio
            servicios_objs = serializer.validated_data.pop('id_servicios')

            # VALIDACIÓN ADICIONAL (Doble chequeo)
            if not id_prof_obj or id_prof_obj.role not in ['empleado', 'admin'] or not id_prof_obj.is_active:
                raise serializers.ValidationError({"id_prof": "El profesional seleccionado no es válido o no está activo."})

            # 1. Obtener Duración y Servicios (Extraemos los IDs)
            servicios_ids = [s.id_serv for s in servicios_objs]
            duracion_necesaria, _ = calcular_duracion_total(servicios_ids)

            # 3. Validación de Solapamiento FINAL
            rangos_ocupados = obtener_rangos_ocupados(id_prof_obj.id, fecha_turno)
            
            start_dt = datetime.combine(fecha_turno, hora_turno, tzinfo=pytz.timezone(TIME_ZONE))
            end_dt = start_dt + duracion_necesaria
            rango_turno_actual = (start_dt, end_dt)
            
            is_available = all(rango_turno_actual[1] <= o[0] or rango_turno_actual[0] >= o[1] for o in rangos_ocupados)
            
            if not is_available:
                raise serializers.ValidationError({"hora_turno": "El horario seleccionado ya no está disponible."})

            # 4. Crear el turno
            turno = Turnos.objects.create(
                id_cli=id_cli,
                id_prof=id_prof_obj,
                fecha_turno=fecha_turno,
                hora_turno=hora_turno,
                estado_turno='pendiente',
                observaciones=serializer.validated_data.get('observaciones', '')
            )
            
            # 5. Crear las relaciones
            for serv in servicios_objs:
                 turno.servicios_incluidos.add(serv)
            
            turno.save()
            
            # 💡 CORRECCIÓN CRÍTICA: Devolver la instancia del modelo 'turno'
            # Esto permite a DRF serializar la respuesta 201 correctamente.
            return turno 
        
        except serializers.ValidationError as ve:
            raise ve
        except Exception as e:
            print(f"💥 Error en perform_create (Excepción general): {str(e)}")
            raise serializers.ValidationError({"detail": f"Error interno al procesar el turno: {str(e)}"})


class TurnosXServicosViewSet(viewsets.ModelViewSet):
    queryset = TurnosXServicios.objects.all().select_related('id_turno', 'id_serv')
    serializer_class = TurnosXServiciosSerializer
    permission_classes = [permissions.IsAuthenticated]