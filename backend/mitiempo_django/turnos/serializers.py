# turnos/serializers.py
from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from django.contrib.auth import get_user_model
from .models import Turno, TurnoServicio, ConfiguracionLocal
from servicio.models import Servicio

User = get_user_model()


class TurnoServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.nombre_serv', read_only=True)
    servicio_precio = serializers.DecimalField(source='servicio.precio_serv', max_digits=9, decimal_places=2, read_only=True)

    class Meta:
        model = TurnoServicio
        fields = [
            'id_turno_servicio',
            'servicio',
            'servicio_nombre',
            'duracion_servicio',
            'servicio_precio',
        ]
        read_only_fields = ['servicio_nombre', 'servicio_precio']


class TurnoListSerializer(serializers.ModelSerializer):
    cliente = serializers.StringRelatedField()  # muestra el username o get_full_name del User
    servicios = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.DateTimeField(source='fecha_hora_fin', read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id_turno',
            'cliente',
            'fecha_hora_inicio',
            'fecha_hora_fin',
            'estado',
            'servicios',
        ]

    def get_servicios(self, obj):
        # Devuelve lista con nombre y duración de cada servicio del turno
        return [
            {
                'id': ts.servicio.id_serv,
                'nombre': ts.servicio.nombre_serv,
                'duracion_servicio': ts.duracion_servicio,
                'precio_serv': ts.servicio.precio_serv,
            }
            for ts in obj.servicios_asignados.select_related('servicio').all()
        ]


class TurnoDetailSerializer(serializers.ModelSerializer):
    cliente = serializers.StringRelatedField()
    servicios = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.DateTimeField(source='fecha_hora_fin', read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id_turno',
            'cliente',
            'fecha_hora_inicio',
            'fecha_hora_fin',
            'estado',
            'observaciones',
            'servicios',
        ]

    def get_servicios(self, obj):
        return [
            {
                'id': ts.servicio.id_serv,
                'nombre': ts.servicio.nombre_serv,
                'duracion_servicio': ts.duracion_servicio,
                'precio_serv': ts.servicio.precio_serv,
            }
            for ts in obj.servicios_asignados.select_related('servicio').all()
        ]


class TurnoCreateSerializer(serializers.ModelSerializer):
    """
    Crear Turno:
    - 'servicios' debe ser una lista de IDs de Servicio: [1,2,3]
    - 'cliente' puede pasarse si el usuario es admin; si no, se asume request.user
    """
    servicios = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        allow_empty=False
    )

    cliente = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = ['id_turno', 'cliente', 'fecha_hora_inicio', 'fecha_hora_fin', 'observaciones', 'servicios']
        read_only_fields = ['id_turno', 'fecha_hora_fin']

    def validate_fecha_hora_inicio(self, value):
        now = timezone.now()
        if value < now:
            raise serializers.ValidationError("No se puede reservar en una fecha/hora pasada.")
        return value

    def validate(self, data):
        """
        Validaciones generales:
        - servicios existan y estén activos
        - dentro de dias_abiertos y dias_disponibles de servicios
        - no solapamiento con otros turnos
        - horario dentro de apertura/cierre del local
        """
        servicios_ids = data.get('servicios', [])
        if not servicios_ids:
            raise serializers.ValidationError("Debe especificar al menos un servicio.")

        servicios_qs = Servicio.objects.filter(id_serv__in=servicios_ids, activado=True)
        if servicios_qs.count() != len(set(servicios_ids)):
            raise serializers.ValidationError("Alguno de los servicios no existe o está inactivo.")

        # calcular duracion total en minutos
        duracion_total = 0
        servicios_map = {}
        for serv in servicios_qs:
            duracion_total += serv.duracion_minutos
            servicios_map[serv.id_serv] = serv

        # guardar en contexto para usar en create()
        self._servicios_map = servicios_map
        self._duracion_total = duracion_total

        # Validar dias abiertos y días disponibles para cada servicio
        config = ConfiguracionLocal.objects.first()
        if not config:
            raise serializers.ValidationError("Falta la configuración del local. Debe existir un registro en ConfiguracionLocal.")

        fecha_inicio = data.get('fecha_hora_inicio')
        if not fecha_inicio:
            raise serializers.ValidationError("Se requiere fecha_hora_inicio.")

        # normalizar nombre del día
        dia_semana = fecha_inicio.strftime("%A").lower()
        equivalencias = {
            "monday": "lunes",
            "tuesday": "martes",
            "wednesday": "miercoles",
            "thursday": "jueves",
            "friday": "viernes",
            "saturday": "sabado",
            "sunday": "domingo"
        }
        dia_semana = equivalencias.get(dia_semana, dia_semana)

        if dia_semana not in config.dias_abiertos:
            raise serializers.ValidationError(f"El local no abre los días {dia_semana}.")

        for serv in servicios_qs:
            if dia_semana not in serv.dias_disponibles:
                raise serializers.ValidationError(f"El servicio '{serv.nombre_serv}' no se ofrece los días {dia_semana}.")

        # Validar horario de apertura/cierre
        apertura = config.hora_apertura
        cierre = config.hora_cierre

        # construir horas de inicio y fin (hora_local) sin modificar fecha
        fecha_fin = fecha_inicio + timedelta(minutes=duracion_total)

        # comprobar que la hora de inicio y fin estén dentro de apertura/cierre
        if not (apertura <= fecha_inicio.time() < cierre):
            raise serializers.ValidationError("La hora de inicio está fuera del horario de atención del local.")
        if not (apertura < fecha_fin.time() <= cierre) and fecha_fin.date() == fecha_inicio.date():
            raise serializers.ValidationError("La hora de finalización está fuera del horario de atención del local.")

        # Validar solapamiento con otros turnos (agenda global)
        # se considera solapamiento si: existing.start < new_end and existing.end > new_start
        from django.db.models import Q

        new_start = fecha_inicio
        new_end = fecha_fin

        overlapping = Turno.objects.filter(
            fecha_hora_inicio__lt=new_end
        ).filter(
            # existing end > new_start
            # existing end = existing.fecha_hora_inicio + duration. We'll approximate via duracion_total_minutos property by joining through servicios_asignados
            # Simpler approach: iterate existing turnos and compute end in Python for robust check.
            # We'll fetch candidates whose start < new_end and start >= some lower bound to reduce scan.
            # Use no extra DB-level filter beyond start < new_end; compute precise overlap below.
        ).select_related().prefetch_related('servicios_asignados__servicio')

        # compute overlap precisely
        for t in overlapping:
            # skip self (in update cases)
            if hasattr(self.instance, 'id_turno') and t.id_turno == self.instance.id_turno:
                continue
            # compute existing end
            existing_duration = t.duracion_total_minutos or 0
            existing_end = t.fecha_hora_inicio + timedelta(minutes=existing_duration)
            if (t.fecha_hora_inicio < new_end) and (existing_end > new_start):
                raise serializers.ValidationError("El horario solicitado se superpone con otro turno ya reservado.")

        # bloquear fechas-horas ya pasadas (ya validado fecha_hora_inicio < now)
        # todo ok
        return data

    def create(self, validated_data):
        servicios_ids = validated_data.pop('servicios')
        request = self.context.get('request')

        # Cliente assignment:
        cliente = validated_data.pop('cliente', None)
        if cliente is None:
            # si es admin y cliente no pasado -> error? Elegimos asignar a request.user si existe.
            if request and getattr(request.user, 'is_staff', False):
                raise serializers.ValidationError("Como admin debe especificar el cliente al crear un turno.")
            cliente = request.user

        # si no es admin, forzar cliente = request.user
        if request and not getattr(request.user, 'is_staff', False):
            cliente = request.user

        fecha_hora_inicio = validated_data.get('fecha_hora_inicio')
        observaciones = validated_data.get('observaciones', '')

        # crear turno y asignar servicios en transacción
        try:
            with transaction.atomic():
                turno = Turno.objects.create(
                    cliente=cliente,
                    fecha_hora_inicio=fecha_hora_inicio,
                    estado='pendiente',
                    observaciones=observaciones
                )

                # crear TurnoServicio para cada servicio (tomando duracion del servicio)
                detalles_para_crear = []
                for sid in servicios_ids:
                    serv = self._servicios_map.get(sid)
                    if not serv:
                        # protección adicional
                        serv = Servicio.objects.get(id_serv=sid)
                    dur = serv.duracion_minutos or 30
                    detalles_para_crear.append(
                        TurnoServicio(
                            turno=turno,
                            servicio=serv,
                            duracion_servicio=dur
                        )
                    )
                TurnoServicio.objects.bulk_create(detalles_para_crear)

                # refrescar turno para que duracion_total_minutos y fecha_hora_fin funcionen
                turno.refresh_from_db()
                return turno

        except Exception as e:
            raise serializers.ValidationError(f"Error al crear el turno: {str(e)}")


class TurnoUpdateSerializer(serializers.ModelSerializer):
    # Permite actualizar estado y observaciones (no permitir cambiar fecha/servicios por ahora)
    class Meta:
        model = Turno
        fields = ['estado', 'observaciones']
