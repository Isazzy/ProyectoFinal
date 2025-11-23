# servicios/serializers.py
from rest_framework import serializers
from .models import Servicio, ServicioInsumo
from inventario.models import Insumo


class ServicioInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.CharField(source='insumo.insumo_nombre', read_only=True)
    insumo_unidad = serializers.CharField(source='insumo.insumo_unidad', read_only=True)
    insumo_stock = serializers.DecimalField(source='insumo.insumo_stock', max_digits=12, decimal_places=3, read_only=True)

    class Meta:
        model = ServicioInsumo
        fields = ['id', 'servicio', 'insumo', 'insumo_nombre', 'insumo_unidad', 'insumo_stock', 'cantidad_usada']
        read_only_fields = ['insumo_nombre', 'insumo_unidad', 'insumo_stock']


class ServicioListSerializer(serializers.ModelSerializer):
    # campos amigables para frontend
    id_serv = serializers.IntegerField(source='pk', read_only=True)
    nombre = serializers.CharField()
    duracion = serializers.IntegerField()
    precio = serializers.DecimalField(max_digits=9, decimal_places=2, )
    activo = serializers.BooleanField()

    class Meta:
        model = Servicio
        fields = ['id_serv', 'tipo_serv', 'nombre', 'precio', 'duracion', 'activo', 'dias_disponibles']


class ServicioDetailSerializer(serializers.ModelSerializer):
    id_serv = serializers.IntegerField(source='pk', read_only=True)
    receta = ServicioInsumoSerializer(many=True, source='servicioinsumo_set', read_only=True)

    class Meta:
        model = Servicio
        fields = ['id_serv', 'tipo_serv', 'nombre', 'precio', 'duracion', 'dias_disponibles', 'descripcion', 'activo', 'receta']


class ServicioCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['tipo_serv', 'nombre', 'precio', 'duracion', 'dias_disponibles', 'descripcion', 'activo']

    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0.")
        return value

    def validate_duracion(self, value):
        if value < 5:
            raise serializers.ValidationError("La duración mínima es de 5 minutos.")
        return value

    def validate_dias_disponibles(self, value):
        if not value:
            raise serializers.ValidationError("Debe seleccionar al menos un día disponible.")
        dias_validos = {"lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"}
        for d in value:
            if str(d).lower().strip() not in dias_validos:
                raise serializers.ValidationError(f"'{d}' no es un día válido.")
        # normalizar
        return [str(d).lower().strip() for d in value]
