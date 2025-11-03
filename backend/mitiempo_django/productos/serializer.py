# productos/serializers.py
from rest_framework import serializers
from .models import Productos, Proveedores, ProductosXProveedores, DetVentas, DetCompras

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedores
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    proveedor_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, source='proveedor_rel'
    )
    class Meta:
        model = Productos
        fields = '__all__'

class ProductoStockAjusteSerializer(serializers.Serializer):
    delta = serializers.IntegerField()  # positivo suma stock, negativo descuenta
    motivo = serializers.CharField(required=False, allow_blank=True)
