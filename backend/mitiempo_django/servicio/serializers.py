# servicios/serializers.py
from rest_framework import serializers
from .models import Servicio, ServicioInsumo
from inventario.models import Insumo
from django.db import transaction


# Agregamos un serializer simple para recibir datos de escritura de la receta
class ServicioInsumoWriteSerializer(serializers.Serializer):
    insumo_id = serializers.IntegerField()
    cantidad_usada = serializers.DecimalField(max_digits=12, decimal_places=3)

class ServicioInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.CharField(source='insumo.insumo_nombre', read_only=True)
    insumo_unidad = serializers.CharField(source='insumo.insumo_unidad', read_only=True)
    insumo_stock = serializers.DecimalField(source='insumo.insumo_stock', max_digits=12, decimal_places=3, read_only=True)
    cantidad_usada = serializers.DecimalField(
        source='cantidad',  # <--- CORRECCIÓN IMPORTANTE
        max_digits=10, 
        decimal_places=3, 
        read_only=True
    )
    class Meta:
        model = ServicioInsumo
        # Asegúrate de incluir 'cantidad_usada' en fields y quitar 'cantidad' si estaba
        fields = ['id', 'servicio', 'insumo', 'insumo_nombre', 'insumo_unidad', 'insumo_stock', 'cantidad_usada']


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
    # Agregamos este campo para aceptar el array JSON desde el front
    receta = ServicioInsumoWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Servicio
        fields = ['tipo_serv', 'nombre', 'precio', 'duracion', 'dias_disponibles', 'descripcion', 'activo', 'receta']

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

    def create(self, validated_data):
        receta_data = validated_data.pop('receta', [])
        
        with transaction.atomic():
            servicio = super().create(validated_data)
            self._guardar_receta(servicio, receta_data)
        return servicio

    def update(self, instance, validated_data):
        receta_data = validated_data.pop('receta', None)
        
        with transaction.atomic():
            servicio = super().update(instance, validated_data)
            if receta_data is not None:
                self._guardar_receta(servicio, receta_data)
        return servicio

    def _guardar_receta(self, servicio, receta_data):
        servicio.insumos_receta.all().delete()
        insumos_objs = []
        for item in receta_data:
            insumos_objs.append(ServicioInsumo(
                servicio=servicio,
                insumo_id=item['insumo_id'],
                # CORRECCIÓN: El modelo usa 'cantidad', el JSON de entrada 'cantidad_usada'
                cantidad=item['cantidad_usada'] 
            ))
        ServicioInsumo.objects.bulk_create(insumos_objs)