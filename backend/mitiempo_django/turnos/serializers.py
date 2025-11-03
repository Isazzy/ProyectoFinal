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

    class Meta:
        model = Turno
        fields = [
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
        return data

    @transaction.atomic
    def create(self, validated_data):
        servicios_objs = validated_data.pop('servicios_a_guardar')
        turno = Turno.objects.create(**validated_data)
        for s in servicios_objs:
            TurnoServicio.objects.create(turno=turno, servicio=s)
        return turno

    @transaction.atomic
    def update(self, instance, validated_data):
        servicios_objs = validated_data.pop('servicios_a_guardar', None)
        instance = super().update(instance, validated_data)
        if servicios_objs is not None:
            instance.servicios_asignados.all().delete()
            for s in servicios_objs:
                TurnoServicio.objects.create(turno=instance, servicio=s)
        instance.refresh_from_db()
        return instance
