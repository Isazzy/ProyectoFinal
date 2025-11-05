from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

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
        queryset=User.objects.filter(groups__name='Cliente'),
        required=False,
        default=serializers.CurrentUserDefault()
    )
    servicios_ids = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    servicios_asignados = TurnoServicioSerializer(many=True, read_only=True)
    cliente_nombre = serializers.StringRelatedField(source='cliente', read_only=True)
    duracion_total_minutos = serializers.ReadOnlyField()
    fecha_hora_fin = serializers.ReadOnlyField()

    class Meta:
        model = Turno
        fields = [
            'id_turno', 'cliente', 'cliente_nombre', 'fecha_hora_inicio',
            'estado', 'observaciones', 'servicios_ids', 'servicios_asignados',
            'duracion_total_minutos', 'fecha_hora_fin'
        ]
        read_only_fields = ['id_turno']

    def validate(self, data):
        """
        Validaciones:
        - No permitir turnos en el pasado.
        - Requiere al menos un servicio.
        - El cliente no puede tener más de un turno activo del mismo servicio.
        - Máximo 2 clientes distintos en horarios solapados.
        """
        request = self.context.get('request')
        usuario = request.user if request else None

        servicios_objs = data.pop('servicios_ids', None)
        if self.instance is None and not servicios_objs:
            raise serializers.ValidationError("Debe seleccionar al menos un servicio.")
        if servicios_objs is not None and len(servicios_objs) == 0:
            raise serializers.ValidationError("Debe seleccionar al menos un servicio.")

        fecha_inicio = data.get('fecha_hora_inicio') or (self.instance and self.instance.fecha_hora_inicio)
        if not fecha_inicio:
            raise serializers.ValidationError("Debe especificar la fecha y hora de inicio.")

        now = timezone.now()
        if fecha_inicio < now:
            raise serializers.ValidationError("No se pueden crear turnos en el pasado.")

        # Calcular duración total
        if servicios_objs:
            data['servicios_a_guardar'] = servicios_objs
            total_minutos = sum(s.duracion_minutos for s in servicios_objs)
        else:
            servicios_objs = [ts.servicio for ts in (self.instance.servicios_asignados.all() if self.instance else [])]
            total_minutos = sum(s.duracion_minutos for s in servicios_objs)

        duracion_necesaria = timedelta(minutes=total_minutos or 30)
        fecha_fin_propuesta = fecha_inicio + duracion_necesaria

        # Determinar cliente
        cliente_obj = data.get('cliente') or (self.instance and self.instance.cliente) or usuario
        if not cliente_obj:
            raise serializers.ValidationError("No se pudo determinar el cliente.")

        # --- Regla A: Cliente no puede tener más de 1 turno activo del mismo servicio ---
        # --- Regla A: Cliente no puede tener más de 2 turnos activos del mismo servicio ---
        if servicios_objs:
            for s in servicios_objs:
                q = Turno.objects.filter(
                    cliente=cliente_obj,
                    estado__in=['pendiente', 'confirmado'],
                    servicios_asignados__servicio=s
                )
                if self.instance:
                    q = q.exclude(pk=self.instance.pk)
                if q.count() >= 2:
                    raise serializers.ValidationError(
                        f"Ya tienes 2 turnos activos para el servicio '{s.nombre_serv}'. No puedes reservar más."
                    )


        # --- Regla B: Máximo 2 turnos solapados entre distintos clientes ---
        overlap_q = Turno.objects.filter(
            estado__in=['pendiente', 'confirmado'],
            fecha_hora_inicio__lt=fecha_fin_propuesta
        ).distinct()

        overlapping_turnos = []
        for t in overlap_q:
            dur_min_t = sum(
                sa.servicio.duracion_minutos for sa in t.servicios_asignados.all()
            )
            fin_t = t.fecha_hora_inicio + timedelta(minutes=dur_min_t or 30)
            if fin_t > fecha_inicio and (not self.instance or t.pk != self.instance.pk):
                overlapping_turnos.append(t)

        distinct_client_ids = set(t.cliente_id for t in overlapping_turnos)
        limit_capacity = 2
        will_add_client = cliente_obj.id not in distinct_client_ids
        projected = len(distinct_client_ids) + (1 if will_add_client else 0)

        if projected > limit_capacity:
            raise serializers.ValidationError(
                "El horario seleccionado ya tiene la capacidad máxima de reservas (2 clientes)."
            )

        return data

    @transaction.atomic
    def create(self, validated_data):
        servicios_objs = validated_data.pop('servicios_a_guardar', [])
        turno = Turno.objects.create(**validated_data)
        for s in servicios_objs:
            TurnoServicio.objects.create(turno=turno, servicio=s)
        return turno

    @transaction.atomic
    def update(self, instance, validated_data):
        servicios_objs = validated_data.pop('servicios_a_guardar', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if servicios_objs is not None:
            instance.servicios_asignados.all().delete()
            for s in servicios_objs:
                TurnoServicio.objects.create(turno=instance, servicio=s)
        instance.refresh_from_db()
        return instance
