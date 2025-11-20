# turnos/utils.py
import pytz
import locale
import re
from datetime import timedelta, datetime, date
from django.conf import settings
from rest_framework import serializers

# Importa tus modelos
from .models import Servicios, Turnos

TIME_ZONE = getattr(settings, 'TIME_ZONE', 'UTC')

def normalize_day_name(day_str):
    """Normaliza el nombre del día a minúsculas y sin tildes."""
    if not day_str:
        return ''
    s = day_str.lower().strip()
    s = s.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    return s.replace('ñ', 'n')

def calcular_duracion_total(servicios_ids):
    """Calcula la duración total sumada de una lista de IDs de servicio."""
    try:
        servicios_objs = Servicios.objects.filter(pk__in=servicios_ids, activado=True) 
        if not servicios_objs.exists():
            raise serializers.ValidationError("No se encontraron servicios válidos o activos.")

        duracion_segundos = sum([s.duracion_serv.total_seconds() for s in servicios_objs if s.duracion_serv], 0)

        if duracion_segundos == 0:
            raise serializers.ValidationError("Los servicios seleccionados no tienen una duración definida.")
            
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
        
        if duracion_segundos == 0: 
            duracion_segundos = 30 * 60 # Default 30 min por seguridad

        start_dt = datetime.combine(fecha, t.hora_turno, tzinfo=pytz.timezone(TIME_ZONE))
        end_dt = start_dt + timedelta(seconds=duracion_segundos)
        rangos_ocupados.append((start_dt, end_dt))
        
    return rangos_ocupados