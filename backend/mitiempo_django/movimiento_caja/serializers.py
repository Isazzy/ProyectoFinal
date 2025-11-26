from rest_framework import serializers
from .models import Ingreso, Egreso

# --- Serializers individuales ---
class IngresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingreso
        # Incluimos los campos nuevos de fecha y hora
        fields = ['id', 'caja', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha', 'ingreso_hora']
        # CORRECCIÓN CRÍTICA: 'caja' debe ser read_only
        read_only_fields = ['id', 'caja', 'ingreso_fecha', 'ingreso_hora']

class EgresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Egreso
        # Incluimos los campos nuevos de fecha y hora
        fields = ['id', 'caja', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha', 'egreso_hora']
        # CORRECCIÓN CRÍTICA: 'caja' debe ser read_only
        read_only_fields = ['id', 'caja', 'egreso_fecha', 'egreso_hora']

# --- Serializer Consolidado (Lectura) ---
class MovimientoConsolidadoSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    tipo = serializers.CharField() 
    fecha = serializers.DateTimeField() # La vista combinará fecha+hora
    descripcion = serializers.CharField()
    monto = serializers.DecimalField(max_digits=10, decimal_places=2)

    def get_id(self, obj):
        return f"{obj['tipo'].lower()}-{obj['id']}"