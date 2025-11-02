<<<<<<< HEAD
<<<<<<< HEAD
# turnos/serializers.py
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
<<<<<<< HEAD
from datetime import timedelta
<<<<<<< HEAD
import pytz
from django.conf import settings
=======
from datetime import datetime, timedelta
>>>>>>> 5f5a7856 (Actualizacion de models.py)

# Importamos los nuevos modelos de turnos
from .models import Turno, TurnoServicio, ConfiguracionLocal
# Importamos el modelo Servicio
from servicio.models import Servicio
# Asumimos que tienes un Serializer básico para Servicio
# (si no, crea uno simple en servicio/serializers.py)
try:
    from servicio.serializers import ServicioSerializer
except ImportError:
    # Fallback por si no existe el serializer de Servicio
    class ServicioSerializer(serializers.ModelSerializer):
        class Meta:
            model = Servicio
            fields = ['id_serv', 'nombre_serv'] # Ajusta según tu modelo

# --- Helper de Días ---
# (Necesario para la validación)
def get_dia_semana_es(fecha):
    """
    Devuelve el nombre del día de la semana en español, minúsculas y sin tildes.
    """
    dias = {
        'Monday': 'lunes',
        'Tuesday': 'martes',
        'Wednesday': 'miercoles',
        'Thursday': 'jueves',
        'Friday': 'viernes',
        'Saturday': 'sabado',
        'Sunday': 'domingo'
    }
    # .strftime('%A') devuelve el nombre en inglés (locale-dependent)
    # Lo normalizamos a nuestro estándar.
    return dias.get(fecha.strftime('%A'), '').lower()

# --- Serializer para la tabla intermedia (Lectura) ---

class TurnoServicioSerializer(serializers.ModelSerializer):
    """
    Serializer para MOSTRAR los servicios asignados a un turno.
    Muestra el detalle del servicio y la duración específica de ese turno.
    """
    # Muestra los detalles del servicio (nombre, etc.)
    servicio = ServicioSerializer(read_only=True) 
    
    class Meta:
        model = TurnoServicio
        # Muestra solo los campos relevantes de la tabla intermedia
        fields = ['servicio', 'duracion_servicio']


# --- Serializer Principal de Turno ---

class TurnoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para crear, ver y actualizar Turnos.
    Toda la lógica de validación (horarios, solapamientos) 
    ocurre aquí.
    """

    # --- CAMPOS DE ESCRITURA (para POST/PUT) ---

    # El cliente se asignará automáticamente desde el usuario logueado en la vista
    # No es necesario enviarlo en el JSON, pero lo mantenemos por si se crea
    # desde el admin.
    cliente = serializers.PrimaryKeyRelatedField(
        read_only=True, 
        default=serializers.CurrentUserDefault()
    )
    
    # Campo clave para CREAR: El frontend solo envía una lista de IDs [1, 2]
    servicios_ids = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(),
        many=True,
        write_only=True,
        required=True,
        allow_empty=False,
        label="Servicios a reservar"
    )

    # --- CAMPOS DE LECTURA (para GET) ---

    # Muestra el nombre del cliente en lugar de su ID
    cliente_nombre = serializers.StringRelatedField(source='cliente', read_only=True)
    
<<<<<<< HEAD
    # Campo 'fecha_hora_fin' es solo de lectura, lo calculamos nosotros
    fecha_hora_fin = serializers.DateTimeField(read_only=True)
=======

from .models import Turno, TurnoServicio, ConfiguracionLocal
from servicio.models import Servicio

User = get_user_model()


class TurnoServicioSerializer(serializers.ModelSerializer):
    servicio = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TurnoServicio
        fields = ['servicio', 'duracion_servicio']

    def get_servicio(self, obj):
        return {
            'id_serv': obj.servicio.id_serv,
            'nombre_serv': obj.servicio.nombre_serv,
            'duracion_minutos': obj.servicio.duracion_minutos
        }


class TurnoSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='cliente'),
        required=False,
        default=serializers.CurrentUserDefault()
    )
    servicios_ids = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(),
        many=True,
        write_only=True,
        required=False  # <-- no obligatorio en update
    )
    servicios_asignados = TurnoServicioSerializer(many=True, read_only=True)
    cliente_nombre = serializers.StringRelatedField(source='cliente', read_only=True)
    duracion_total_minutos = serializers.ReadOnlyField()
    fecha_hora_fin = serializers.ReadOnlyField()
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    # Muestra los servicios usando el serializer de arriba
    # Usa la 'related_name' que definimos en el modelo TurnoServicio
    servicios_asignados = TurnoServicioSerializer(
        many=True, 
        read_only=True, 
        source='servicios_asignados'
    )
    
    # Muestra los campos calculados por las @property del modelo
    duracion_total_minutos = serializers.ReadOnlyField()
    fecha_hora_fin = serializers.ReadOnlyField()
>>>>>>> 5f5a7856 (Actualizacion de models.py)

    class Meta:
        model = Turno
        fields = [
<<<<<<< HEAD
<<<<<<< HEAD
            'id_turno', 
            'fecha_hora_inicio', # Nuevo campo (escritura)
            'fecha_hora_fin',    # Nuevo campo (lectura)
            'estado_turno', 
            'observaciones',
=======
            'id',
            'cliente',              # (Write-Only, por default)
            'cliente_nombre',       # (Read-Only)
            'fecha_hora_inicio',    # (Read/Write)
            'estado',               # (Read-Only, se gestiona por default)
            'observaciones',        # (Read/Write)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
            
            # --- Campos de Relaciones ---
            'servicios_ids',        # (Write-Only)
            'servicios_asignados',  # (Read-Only)
            
            # --- Campos Calculados ---
            'duracion_total_minutos', # (Read-Only)
            'fecha_hora_fin',       # (Read-Only)
        ]
        read_only_fields = ['id', 'estado']

    
    def validate(self, data):
        """
        Validación central para crear o actualizar un turno.
        Comprueba la configuración global del local.
        """
        # Obtenemos la fecha/hora de inicio (ya sea la nueva o la existente)
        fecha_hora_inicio = data.get('fecha_hora_inicio', getattr(self.instance, 'fecha_hora_inicio', None))
        
        # 1. Validar que no sea en el pasado (solo para turnos nuevos)
        if not self.instance and fecha_hora_inicio < timezone.now():
            raise serializers.ValidationError("No se pueden crear turnos en el pasado.")
            
        # 2. Obtener la Configuración General del Local
        try:
            config = ConfiguracionLocal.objects.first()
            if not config:
                raise ConfiguracionLocal.DoesNotExist
        except ConfiguracionLocal.DoesNotExist:
            raise serializers.ValidationError("Error crítico: No se ha configurado el horario del local.")

        # 3. Validar Día Abierto
        dia_semana_str = get_dia_semana_es(fecha_hora_inicio.date())
        
        # Normaliza la lista de días de la config (por si se guardó con mayúsculas)
        dias_abiertos_normalizados = [dia.lower().strip() for dia in config.dias_abiertos]
        
        if dia_semana_str not in dias_abiertos_normalizados:
            raise serializers.ValidationError(f"El local está cerrado los días {dia_semana_str}.")

        # 4. Validar Hora de Apertura
        hora_inicio_turno = fecha_hora_inicio.time()
        if hora_inicio_turno < config.hora_apertura:
            raise serializers.ValidationError(f"El turno no puede empezar antes de la apertura ({config.hora_apertura}).")

        # 5. Calcular Duración y Hora de Cierre
        
        # 'servicios_ids' es una lista de objetos Servicio (convertida por DRF)
        if 'servicios_ids' in data:
            servicios_objs = data['servicios_ids']
        elif self.instance: # Si estamos actualizando sin pasar servicios
            servicios_objs = self.instance.servicios.all()
        else:
            servicios_objs = []
            
        if not servicios_objs:
             raise serializers.ValidationError("Debe seleccionar al menos un servicio.")

        duracion_total = timedelta()
        for s in servicios_objs:
            # Asumimos que el modelo Servicio tiene un campo 'duracion' (DurationField)
            # o 'duracion_minutos' (IntegerField).
            # Usamos el método que definimos en el modelo TurnoServicio
            duracion_min = 0
            if hasattr(s, 'duracion_minutos'): # Si es IntegerField
                 duracion_min = s.duracion_minutos
            elif hasattr(s, 'duracion'): # Si es DurationField
                duracion_min = int(s.duracion.total_seconds() / 60)
            
            duracion_total += timedelta(minutes=(duracion_min or 30)) # Default 30 min

        fecha_hora_fin = fecha_hora_inicio + duracion_total
        
        # Validamos contra la hora de cierre
        if fecha_hora_fin.time() > config.hora_cierre:
             raise serializers.ValidationError(f"El turno (finaliza {fecha_hora_fin.strftime('%H:%M')}) excede la hora de cierre ({config.hora_cierre}).")

        # 6. Validar Solapamiento (Overlap)
        
        # Buscamos turnos existentes que NO estén cancelados/completados
        turnos_conflictivos = Turno.objects.filter(
            fecha_hora_inicio__date=fecha_hora_inicio.date(),
            estado__in=['pendiente', 'confirmado']
        )
        
        # Si estamos actualizando, excluimos el turno actual de la comprobación
        if self.instance:
            turnos_conflictivos = turnos_conflictivos.exclude(pk=self.instance.pk)

        # Iteramos sobre los turnos del día para chequear el solapamiento
        # (Usamos las @property de los modelos)
        for turno_existente in turnos_conflictivos:
            inicio_existente = turno_existente.fecha_hora_inicio
            fin_existente = turno_existente.fecha_hora_fin # Usamos la property

            # Lógica de solapamiento: (InicioA < FinB) y (FinA > InicioB)
            if (fecha_hora_inicio < fin_existente) and (fecha_hora_fin > inicio_existente):
                raise serializers.ValidationError(
                    f"El horario {fecha_hora_inicio.strftime('%H:%M')} a {fecha_hora_fin.strftime('%H:%M')} "
                    f"se solapa con un turno existente (de {inicio_existente.strftime('%H:%M')} a {fin_existente.strftime('%H:%M')})."
                )
        
<<<<<<< HEAD
        # Asignamos al cliente desde el request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['cliente'] = request.user
            
=======
            'id_turno', 'cliente', 'cliente_nombre', 'fecha_hora_inicio', 'estado',
            'observaciones', 'servicios_ids', 'servicios_asignados',
            'duracion_total_minutos', 'fecha_hora_fin'
        ]
        read_only_fields = ['id_turno']

    def validate(self, data):
        servicios_objs = data.pop('servicios_ids', None)
        if servicios_objs is not None:
            if not servicios_objs:
                raise serializers.ValidationError("Debe seleccionar al menos un servicio.")
            data['servicios_a_guardar'] = servicios_objs
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
        # Guardamos los servicios para usarlos en create/update
        data['servicios_a_guardar'] = servicios_objs
>>>>>>> 5f5a7856 (Actualizacion de models.py)
        return data

    @transaction.atomic
    def create(self, validated_data):
<<<<<<< HEAD
<<<<<<< HEAD
        # 'servicios_incluidos' ya viene como una lista de objetos gracias a 'source'
        servicios = validated_data.pop('servicios_incluidos') 
=======
        # Asignamos el cliente desde el contexto (inyectado por la vista)
        validated_data['cliente'] = self.context['request'].user
>>>>>>> 5f5a7856 (Actualizacion de models.py)
        
        # Quitamos los servicios del dict principal
        servicios_objs = validated_data.pop('servicios_a_guardar')
        
        # 1. Creamos el Turno
        turno = Turno.objects.create(**validated_data)
        
        # 2. Creamos las relaciones en TurnoServicio
        for servicio in servicios_objs:
            # El método .save() que definimos en el modelo TurnoServicio
            # se encargará de autocompletar la 'duracion_servicio'.
            TurnoServicio.objects.create(
                turno=turno,
                servicio=servicio
            )
        
=======
        servicios_objs = validated_data.pop('servicios_a_guardar')
        turno = Turno.objects.create(**validated_data)
        for s in servicios_objs:
            TurnoServicio.objects.create(turno=turno, servicio=s)
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
        return turno

    @transaction.atomic
    def update(self, instance, validated_data):
<<<<<<< HEAD
<<<<<<< HEAD
        servicios = validated_data.pop('servicios_incluidos', None)
        
        # Actualizamos los campos simples
=======
        servicios_objs_list = validated_data.pop('servicios_a_guardar', None)

        # 1. Actualiza los campos simples del Turno (ej: fecha_hora_inicio)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
        instance = super().update(instance, validated_data)

        # 2. Si el payload incluía una *nueva* lista de servicios
        if servicios_objs_list is not None:
            # Borramos los servicios anteriores
            instance.servicios_asignados.all().delete()
            
<<<<<<< HEAD
        # Guardamos la instancia (super() ya lo hace, pero por claridad)
        instance.save()
        return instance
=======
        servicios_objs = validated_data.pop('servicios_a_guardar', None)
        instance = super().update(instance, validated_data)
        if servicios_objs is not None:
            instance.servicios_asignados.all().delete()
            for s in servicios_objs:
                TurnoServicio.objects.create(turno=instance, servicio=s)
        instance.refresh_from_db()
        return instance
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
            # Creamos los nuevos
            for servicio in servicios_objs_list:
                TurnoServicio.objects.create(
                    turno=instance,
                    servicio=servicio
                    # duracion_servicio se autocompleta
                )
        
        # Refrescamos el objeto para que las properties se recalculen
        instance.refresh_from_db() 
        return instance
>>>>>>> 5f5a7856 (Actualizacion de models.py)
