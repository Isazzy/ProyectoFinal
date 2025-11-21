from rest_framework import serializers
from .models import Ingreso, Egreso

# --- Serializer para CREAR movimientos (este ya lo tenías) ---
class IngresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingreso
        fields = ['id', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha_hora']
        read_only_fields = ['id', 'ingreso_fecha_hora']
        # 'caja' se asignará en la vista

class EgresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Egreso
        fields = ['id', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha_hora']
        read_only_fields = ['id', 'egreso_fecha_hora']
        # 'caja' se asignará en la vista

# --- NUEVO: Serializer para LEER movimientos combinados ---
# Un serializer genérico para formatear los datos que vienen de 
# diferentes modelos (Ingreso, Venta, Egreso, Compra)
class MovimientoConsolidadoSerializer(serializers.Serializer):
    """
    Formatea una lista combinada de movimientos (Ventas, Ingresos, Compras, Egresos)
    para la vista de detalle de caja.
    """
    id = serializers.SerializerMethodField()
    tipo = serializers.CharField() # 'Venta', 'Ingreso', 'Compra', 'Egreso'
    fecha_hora = serializers.DateTimeField(source='fecha') # Renombramos el campo
    descripcion = serializers.CharField()
    monto = serializers.DecimalField(max_digits=10, decimal_places=2)

    def get_id(self, obj):
        # Crea un ID único compuesto (ej: "venta-101", "ingreso-5")
        return f"{obj['tipo'].lower()}-{obj['id']}"