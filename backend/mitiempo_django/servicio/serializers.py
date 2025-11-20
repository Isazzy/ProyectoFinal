# servicios/serializers.py
from rest_framework import serializers
from .models import Servicio, ServicioProfesional

class ServicioProfesionalSerializer(serializers.ModelSerializer):
    """ Muestra qué profesional puede hacer un servicio """
    profesional_username = serializers.CharField(source='profesional.username', read_only=True)
    profesional_id = serializers.IntegerField(source='profesional.id', read_only=True)
    
    class Meta:
        model = ServicioProfesional
        fields = ['profesional_id', 'profesional_username', 'rol']

class ServicioSerializer(serializers.ModelSerializer):
    """ Serializer principal para los Servicios """
    # Muestra la lista de profesionales que pueden hacer este servicio
    profesionales = ServicioProfesionalSerializer(
        source='servicioprofesional_set', 
        many=True, 
        read_only=True
    )
    # Devuelve la duración en minutos (más fácil para el frontend)
    duracion_minutos = serializers.SerializerMethodField()

    class Meta:
        model = Servicio
        fields = [
            'id_serv', 'tipo_serv', 'nombre_serv', 'precio_serv', 
            'duracion_serv', 'duracion_minutos', 'descripcion_serv', 
            'activado', 'rol_requerido', 'profesionales'
        ]

    def get_duracion_minutos(self, obj):
        if obj.duracion_serv:
            return int(obj.duracion_serv.total_seconds() / 60)
        return 0