# servicios/serializers.py
from rest_framework import serializers
from .models import Servicio, ServicioInsumo


class ServicioInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.StringRelatedField(source='insumo.insumo_nombre', read_only=True)
    insumo_unidad = serializers.StringRelatedField(source='insumo.insumo_unidad', read_only=True)

    class Meta:
        model = ServicioInsumo
        fields = ['id', 'insumo', 'insumo_nombre', 'insumo_unidad', 'cantidad_usada']
        read_only_fields = ['insumo_nombre', 'insumo_unidad']


class ServicioListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = [
            'id_serv',
            'tipo_serv',
            'nombre_serv',
            'precio_serv',
            'duracion_minutos',
            'activado',
            'dias_disponibles',
        ]


class ServicioDetailSerializer(serializers.ModelSerializer):
    receta = ServicioInsumoSerializer(many=True, source='servicioinsumo_set', read_only=True)

    class Meta:
        model = Servicio
        fields = [
            'id_serv',
            'tipo_serv',
            'nombre_serv',
            'precio_serv',
            'duracion_minutos',
            'dias_disponibles',
            'descripcion_serv',
            'activado',
            'receta',
        ]


class ServicioCreateUpdateSerializer(serializers.ModelSerializer):
    # Permite crear/editar servicio y (opcional) receta vía otro endpoint.
    class Meta:
        model = Servicio
        fields = [
            'tipo_serv',
            'nombre_serv',
            'precio_serv',
            'duracion_minutos',
            'dias_disponibles',
            'descripcion_serv',
            'activado',
        ]

    def validate_precio_serv(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0.")
        return value

    def validate_duracion_minutos(self, value):
        if value < 5:
            raise serializers.ValidationError("La duración mínima es de 5 minutos.")
        return value

    def validate_dias_disponibles(self, value):
        if not value:
            raise serializers.ValidationError("Debe seleccionar al menos un día disponible.")
        dias_validos = {
            "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
        }
        for d in value:
            if str(d).lower().strip() not in dias_validos:
                raise serializers.ValidationError(f"'{d}' no es un día válido.")
        return [str(d).lower().strip() for d in value]
