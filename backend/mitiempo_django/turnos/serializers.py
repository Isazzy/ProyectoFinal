from rest_framework import serializers
from .models import Servicios, Turnos, TurnosXServicios, ServicioProfesional
from django.contrib.auth import get_user_model
from datetime import timedelta, datetime
from django.utils import timezone # Importar timezone

User = get_user_model()

# --- ServicioSerializer y TurnosXServiciosSerializer (Se mantienen igual) ---

class ServicioProfesionalSerializer(serializers.ModelSerializer):
    profesional_username = serializers.CharField(source='profesional.username', read_only=True)
    class Meta:
        model = ServicioProfesional
        fields = ['profesional', 'profesional_username', 'rol']

class ServicioSerializer(serializers.ModelSerializer):
    profesionales = ServicioProfesionalSerializer(source='servicioprofesional_set', many=True, read_only=True)
    duracion_minutos = serializers.SerializerMethodField() 
    class Meta:
        model = Servicios
        fields = [
            'id_serv', 'tipo_serv', 'nombre_serv', 'precio_serv', 
            'duracion_serv', 'descripcion_serv', 
            'activado', 'rol_requerido', 'profesionales', 'duracion_minutos'
        ]
    def get_duracion_minutos(self, obj):
        if obj.duracion_serv:
            return int(obj.duracion_serv.total_seconds() / 60)
        return 0

class TurnosXServiciosSerializer(serializers.ModelSerializer):
    servicio = ServicioSerializer(source="id_serv", read_only=True)
    id_serv = serializers.PrimaryKeyRelatedField(queryset=Servicios.objects.all(), write_only=True)
    class Meta:
        model = TurnosXServicios
        fields = ['id_turno_servicio', 'id_turno', 'id_serv', 'servicio']


# --- TurnosSerializer (MODIFICADO PARA FULLCALENDAR) ---

class TurnosSerializer(serializers.ModelSerializer):
    id_cli = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False) 
    id_prof = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['empleado', 'admin'], is_active=True), 
        required=True, 
        allow_null=False
    )
    id_servicios = serializers.PrimaryKeyRelatedField(
        queryset=Servicios.objects.filter(activado=True), many=True, write_only=True
    )
    
    # Campos de solo lectura
    cliente = serializers.StringRelatedField(source='id_cli', read_only=True)
    profesional = serializers.StringRelatedField(source='id_prof', read_only=True)
    servicios = TurnosXServiciosSerializer(source='turnosxservicios_set', many=True, read_only=True) 
    
    # 💡 CAMPOS NUEVOS PARA FULLCALENDAR
    title = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    backgroundColor = serializers.SerializerMethodField() # Para los colores

    class Meta:
        model = Turnos
        fields = [
            'id_turno', 'id_cli', 'id_prof', 'fecha_turno', 'hora_turno', 
            'estado_turno', 'observaciones', 'id_servicios', 
            'cliente', 'profesional', 'servicios', 
            # 💡 AÑADIDOS
            'title', 'start', 'end', 'backgroundColor' 
        ]
        read_only_fields = ['id_turno', 'estado_turno']

    def get_title(self, obj):
        """Crea el título del evento."""
        # Intenta obtener el primer nombre del cliente
        cliente_nombre = obj.id_cli.first_name if obj.id_cli.first_name else obj.id_cli.username
        
        # Intenta obtener el primer servicio
        primer_servicio = "Servicios Varios"
        if obj.servicios_incluidos.exists():
            primer_servicio = obj.servicios_incluidos.first().nombre_serv
            
        return f"{cliente_nombre} - {primer_servicio}"

    def get_start(self, obj):
        """Combina fecha y hora en formato ISO."""
        # Usamos la zona horaria de Django para crear un datetime "consciente"
        return datetime.combine(obj.fecha_turno, obj.hora_turno, tzinfo=timezone.get_current_timezone())

    def get_end(self, obj):
        """Calcula la hora de fin sumando la duración."""
        start_dt = datetime.combine(obj.fecha_turno, obj.hora_turno, tzinfo=timezone.get_current_timezone())
        
        duracion_segundos = sum([
            s.duracion_serv.total_seconds() 
            for s in obj.servicios_incluidos.all() if s.duracion_serv
        ], 0)
        
        # Si no hay duración (error de datos), asigna 30 min por defecto para que se vea
        if duracion_segundos == 0:
            duracion_segundos = 30 * 60 
        
        end_dt = start_dt + timedelta(seconds=duracion_segundos)
        return end_dt

    def get_backgroundColor(self, obj):
        """Asigna un color basado en el ID del profesional (para diferenciar agendas)."""
        prof_id = obj.id_prof.id
        # Lista de colores (puedes personalizarlos)
        colors = ['#0284c7', '#be123c', '#059669', '#ca8a04', '#7c3aed', '#db2777', '#ea580c']
        return colors[prof_id % len(colors)] # Asigna un color repetible