from rest_framework import serializers
from .models import Ingreso, Egreso

# --- Serializers individuales ---
class IngresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingreso
        fields = ['id', 'caja', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha', 'ingreso_hora']
        # CORRECCIÓN: 'caja' debe ser read_only para que no falle la validación
        read_only_fields = ['id', 'caja', 'ingreso_fecha', 'ingreso_hora']

class EgresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Egreso
        fields = ['id', 'caja', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha', 'egreso_hora']
        # CORRECCIÓN: 'caja' debe ser read_only
        read_only_fields = ['id', 'caja', 'egreso_fecha', 'egreso_hora']
        # 'caja' se asignará en la vista

# --- Serializer Consolidado (Lectura) ---
class MovimientoConsolidadoSerializer(serializers.Serializer):
    """
    Formatea una lista combinada de movimientos.
    La vista se encarga de combinar fecha y hora en un objeto datetime.
    """
    id = serializers.SerializerMethodField()
    tipo = serializers.CharField() 
    fecha = serializers.DateTimeField()# La vista debe entregar un datetime completo
    descripcion = serializers.CharField()
    monto = serializers.DecimalField(max_digits=10, decimal_places=2)

    def get_id(self, obj):
        return f"{obj['tipo'].lower()}-{obj['id']}"