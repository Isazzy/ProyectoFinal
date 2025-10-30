# turnos/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import pytz
from django.conf import settings

# Importamos los modelos nuevos
from .models import Turno, TurnoServicio
from servicio.models import Servicio, ServicioProfesional
from servicio.serializers import ServicioSerializer # Reutilizamos el serializer

User = get_user_model()
TIME_ZONE = pytz.timezone(getattr(settings, 'TIME_ZONE', 'UTC'))

class TurnoServicioSerializer(serializers.ModelSerializer):
    """ Serializer para mostrar los servicios *dentro* de un turno """
    # Usamos el ServicioSerializer para mostrar detalles completos
    servicio = ServicioSerializer(read_only=True, source='servicio') 
    
    class Meta:
        model = TurnoServicio
        fields = ['id_turno_servicio', 'servicio']


class TurnoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para crear y ver Turnos.
    Utiliza los campos 'fecha_hora_inicio' y 'fecha_hora_fin'.
    """
    
    # --- CAMPOS DE ESCRITURA (lo que envía el frontend) ---
    
    # El cliente se tomará del usuario autenticado (en create)
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='cliente'), 
        required=False, # Lo hacemos no-requerido aquí
        allow_null=True
    )
    
    profesional = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['empleado', 'admin'], is_active=True),
        write_only=True # Solo para escribir
    )
    
    # El frontend solo necesita enviar la lista de IDs de servicios
    servicios_ids = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.filter(activado=True),
        many=True,
        write_only=True,
        required=True,
        allow_empty=False,
        source='servicios_incluidos' # Apunta a la relación M2M
    )
    
    # --- CAMPOS DE LECTURA (lo que recibe el frontend) ---
    
    # Mostramos los nombres para fácil lectura
    cliente_nombre = serializers.StringRelatedField(source='cliente', read_only=True)
    profesional_nombre = serializers.StringRelatedField(source='profesional', read_only=True)
    
    # Mostramos los objetos de servicio completos
    servicios = TurnoServicioSerializer(
        source='turnoservicio_set', # Usamos el 'related_name' del modelo TurnoServicio
        many=True, 
        read_only=True
    )

    # --- CAMPOS PARA FULLCALENDAR (adaptados) ---
    title = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    backgroundColor = serializers.SerializerMethodField()
    
    # Campo 'fecha_hora_fin' es solo de lectura, lo calculamos nosotros
    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id_turno', 
            'fecha_hora_inicio', # Nuevo campo (escritura)
            'fecha_hora_fin',    # Nuevo campo (lectura)
            'estado_turno', 
            'observaciones',
            
            # Campos de Escritura
            'cliente',           # (PK)
            'profesional',       # (PK)
            'servicios_ids',     # (Lista de PKs)
            
            # Campos de Lectura (detallados)
            'cliente_nombre',
            'profesional_nombre',
            'servicios',
            
            # Campos FullCalendar
            'title', 'start', 'end', 'backgroundColor'
        ]
        read_only_fields = ['id_turno', 'estado_turno']

    # --- Métodos de FullCalendar (Ahora mucho más simples) ---
    
    def get_title(self, obj):
        cliente_nombre = obj.cliente.first_name or obj.cliente.username
        return f"Turno de {cliente_nombre}"

    def get_start(self, obj):
        # Simplemente devolvemos el campo
        return obj.fecha_hora_inicio 

    def get_end(self, obj):
        # Simplemente devolvemos el campo
        return obj.fecha_hora_fin 

    def get_backgroundColor(self, obj):
        prof_id = obj.profesional.id
        colors = ['#0284c7', '#be123c', '#059669', '#ca8a04', '#7c3aed', '#db2777', '#ea580c']
        return colors[prof_id % len(colors)]

    # --- LÓGICA DE VALIDACIÓN (Aquí está la magia) ---

    def validate(self, data):
        # 1. Obtener datos clave
        # (usamos .get() por si es un PATCH y no vienen todos los datos)
        # usamos 'data.get(campo, self.instance.campo)' para manejar updates
        instance = self.instance
        
        profesional = data.get('profesional', getattr(instance, 'profesional', None))
        fecha_hora_inicio = data.get('fecha_hora_inicio', getattr(instance, 'fecha_hora_inicio', None))
        
        # 'servicios_incluidos' es el 'source' de 'servicios_ids'
        servicios_objs = data.get('servicios_incluidos', getattr(instance, 'servicios_incluidos', None))
        
        # Si no hay servicios (en un update) los buscamos
        if instance and not 'servicios_incluidos' in data:
            servicios_objs = list(instance.servicios_incluidos.all())
        
        if not all([profesional, fecha_hora_inicio, servicios_objs]):
             raise serializers.ValidationError("Faltan datos clave: profesional, inicio o servicios.")

        # 2. Validar que el inicio no sea en el pasado
        if fecha_hora_inicio < timezone.now():
            raise serializers.ValidationError("No se pueden crear turnos en el pasado.")

        # 3. Calcular duración y hora de fin
        duracion_total = sum(
            [s.duracion_serv for s in servicios_objs if s.duracion_serv], 
            timedelta()
        )
        if duracion_total == timedelta():
            duracion_total = timedelta(minutes=30) # Duración por defecto si falla
            
        fecha_hora_fin = fecha_hora_inicio + duracion_total

        # 4. Validar capacidad del profesional
        servicios_permitidos_ids = set(
            ServicioProfesional.objects.filter(profesional=profesional)
                                    .values_list('servicio_id', flat=True)
        )
        servicios_solicitados_ids = {s.id_serv for s in servicios_objs}
        
        if not servicios_solicitados_ids.issubset(servicios_permitidos_ids):
            raise serializers.ValidationError(
                "El profesional seleccionado no puede realizar uno o más de los servicios solicitados."
            )

        # 5. Validar horario laboral del profesional (JSONField)
        try:
            dia_semana_turno = fecha_hora_inicio.strftime("%A").lower() # ej: 'lunes'
            # Normalizamos el nombre del día
            if dia_semana_turno in ['lunes', 'monday']: dia_nombre = 'lunes'
            elif dia_semana_turno in ['martes', 'tuesday']: dia_nombre = 'martes'
            elif dia_semana_turno in ['miércoles', 'miercoles', 'wednesday']: dia_nombre = 'miércoles'
            elif dia_semana_turno in ['jueves', 'thursday']: dia_nombre = 'jueves'
            elif dia_semana_turno in ['viernes', 'friday']: dia_nombre = 'viernes'
            elif dia_semana_turno in ['sábado', 'sabado', 'saturday']: dia_nombre = 'sábado'
            elif dia_semana_turno in ['domingo', 'sunday']: dia_nombre = 'domingo'
            else: dia_nombre = ''

            horario_profesional = None
            for d in profesional.dias_laborables or []:
                if d.get('dia', '').lower() == dia_nombre:
                    horario_profesional = d
                    break
            
            if not horario_profesional:
                raise serializers.ValidationError(f"El profesional no trabaja el día {dia_nombre}.")

            hora_inicio_laboral = datetime.strptime(horario_profesional.get('inicio', '00:00'), '%H:%M').time()
            hora_fin_laboral = datetime.strptime(horario_profesional.get('fin', '23:59'), '%H:%M').time()

            if not (fecha_hora_inicio.time() >= hora_inicio_laboral and fecha_hora_fin.time() <= hora_fin_laboral):
                 raise serializers.ValidationError(
                     f"El turno debe estar dentro del horario laboral del profesional ({hora_inicio_laboral} - {hora_fin_laboral})."
                 )
        except Exception as e:
            raise serializers.ValidationError(f"Error al validar horario laboral: {e}")


        # 6. VALIDACIÓN DE SUPERPOSICIÓN (¡LA MÁS IMPORTANTE!)
        # Buscamos turnos que:
        # - Empiecen *antes* de que el nuevo termine
        # - Terminen *después* de que el nuevo empiece
        turnos_superpuestos = Turno.objects.filter(
            profesional=profesional,
            estado_turno__in=['pendiente', 'confirmado'],
            fecha_hora_inicio__lt=fecha_hora_fin, # (Existente empieza < Nuevo termina)
            fecha_hora_fin__gt=fecha_hora_inicio    # (Existente termina > Nuevo empieza)
        )
        
        # Si estamos actualizando, excluimos el propio turno de la validación
        if self.instance:
            turnos_superpuestos = turnos_superpuestos.exclude(pk=self.instance.pk)
            
        if turnos_superpuestos.exists():
            raise serializers.ValidationError(
                "El horario seleccionado ya está ocupado. Por favor, elige otro."
            )

        # 7. Inyectamos los datos calculados para usarlos en create/update
        data['fecha_hora_fin'] = fecha_hora_fin
        
        # Asignamos al cliente desde el request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['cliente'] = request.user
            
        return data

    @transaction.atomic
    def create(self, validated_data):
        # 'servicios_incluidos' ya viene como una lista de objetos gracias a 'source'
        servicios = validated_data.pop('servicios_incluidos') 
        
        # Creamos el turno con los datos validados (incluyendo 'fecha_hora_fin')
        turno = Turno.objects.create(**validated_data)
        
        # Usamos .set() para la relación ManyToMany
        turno.servicios_incluidos.set(servicios)
        
        return turno

    @transaction.atomic
    def update(self, instance, validated_data):
        servicios = validated_data.pop('servicios_incluidos', None)
        
        # Actualizamos los campos simples
        instance = super().update(instance, validated_data)
        
        # Si se envió una nueva lista de servicios, la actualizamos
        if servicios is not None:
            instance.servicios_incluidos.set(servicios)
            
        # Guardamos la instancia (super() ya lo hace, pero por claridad)
        instance.save()
        return instance