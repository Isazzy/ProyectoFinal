# productos/serializers.py
from rest_framework import serializers
from .models import Productos, StockHistory

class ProductosSerializer(serializers.ModelSerializer):
    # The 'precio_venta' and 'precio_compra' fields will be serialized as strings 
    # to maintain precision due to DecimalField

    class Meta:
        model = Productos
        # Include all fields from your model
        fields = '__all__'
        # Or list them explicitly:
        # fields = ['id_prod', 'nombre_prod', 'precio_venta', 'precio_compra', 'stock_min_prod', 'stock_act_prod', 'reposicion_prod', 'stock_max_prod', 'tipo_prod']

# productos/serializers.py (continúa)

class StockHistorySerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre_prod')
    
    class Meta:
        model = StockHistory
        fields = '__all__'