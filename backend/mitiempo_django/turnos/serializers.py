from rest_framework import serializers
from .models import Servicios, Turnos, TurnosXServicios
from django.contrib.auth import get_user_model

User = get_user_model()


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicios
        fields = '__all__'


class TurnosXServiciosSerializer(serializers.ModelSerializer):
    servicio = ServicioSerializer(source="id_serv", read_only=True)
    id_serv = serializers.PrimaryKeyRelatedField(
        queryset=Servicios.objects.all(), write_only=True
    )

    class Meta:
        model = TurnosXServicios
        fields = ['id_turno_servicio', 'id_turno', 'id_serv', 'servicio']


class TurnosSerializer(serializers.ModelSerializer):
    cliente = serializers.StringRelatedField(source='id_cli', read_only=True)
    profesional = serializers.StringRelatedField(source='id_prof', read_only=True)
    servicios = TurnosXServiciosSerializer(many=True, read_only=True)

    class Meta:
        model = Turnos
        fields = '__all__'
