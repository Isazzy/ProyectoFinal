<<<<<<< HEAD
<<<<<<< HEAD
# turnos/serializers.py
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
<<<<<<< HEAD
<<<<<<< HEAD
from datetime import timedelta
<<<<<<< HEAD
import pytz
from django.conf import settings
=======
from datetime import datetime, timedelta
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======
from datetime import timedelta
>>>>>>> 67ec8a26 (Producto terminado (Creo))

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
<<<<<<< HEAD
    
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
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
    duracion_total_minutos = serializers.ReadOnlyField()
    fecha_hora_fin = serializers.ReadOnlyField()
>>>>>>> 5f5a7856 (Actualizacion de models.py)

    class Meta:
        model = Turno
        fields = [
<<<<<<< HEAD
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
=======
            'id_turno', 'cliente', 'cliente_nombre', 'fecha_hora_inicio', 'estado',
            'observaciones', 'servicios_ids', 'servicios_asignados',
            'duracion_total_minutos', 'fecha_hora_fin'
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        ]
        read_only_fields = ['id_turno']

    def validate(self, data):
<<<<<<< HEAD
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
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        servicios_objs = data.pop('servicios_ids', None)
        if servicios_objs is not None:
            if not servicios_objs:
                raise serializers.ValidationError("Debe seleccionar al menos un servicio.")
            data['servicios_a_guardar'] = servicios_objs
<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
        # Guardamos los servicios para usarlos en create/update
        data['servicios_a_guardar'] = servicios_objs
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        return data

    @transaction.atomic
    def create(self, validated_data):
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        # 'servicios_incluidos' ya viene como una lista de objetos gracias a 'source'
        servicios = validated_data.pop('servicios_incluidos') 
=======
        # Asignamos el cliente desde el contexto (inyectado por la vista)
        validated_data['cliente'] = self.context['request'].user
>>>>>>> 5f5a7856 (Actualizacion de models.py)
        
        # Quitamos los servicios del dict principal
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        servicios_objs = validated_data.pop('servicios_a_guardar')
        turno = Turno.objects.create(**validated_data)
<<<<<<< HEAD
        
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
=======
        for s in servicios_objs:
            TurnoServicio.objects.create(turno=turno, servicio=s)
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        return turno

    @transaction.atomic
    def update(self, instance, validated_data):
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        servicios = validated_data.pop('servicios_incluidos', None)
        
        # Actualizamos los campos simples
=======
        servicios_objs_list = validated_data.pop('servicios_a_guardar', None)

        # 1. Actualiza los campos simples del Turno (ej: fecha_hora_inicio)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======
        servicios_objs = validated_data.pop('servicios_a_guardar', None)
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        instance = super().update(instance, validated_data)
        if servicios_objs is not None:
            instance.servicios_asignados.all().delete()
<<<<<<< HEAD
            
<<<<<<< HEAD
        # Guardamos la instancia (super() ya lo hace, pero por claridad)
        instance.save()
        return instance
=======
        servicios_objs = validated_data.pop('servicios_a_guardar', None)
        instance = super().update(instance, validated_data)
        if servicios_objs is not None:
            instance.servicios_asignados.all().delete()
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
            for s in servicios_objs:
                TurnoServicio.objects.create(turno=instance, servicio=s)
        instance.refresh_from_db()
        return instance
<<<<<<< HEAD
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
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
