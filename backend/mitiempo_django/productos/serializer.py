from rest_framework import serializers
from .models import Marca, Categoria, Productos, StockHistory

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ["id_marca", "nombre"]

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id_categoria", "nombre", "descripcion"]

class ProductosSerializer(serializers.ModelSerializer):
    marca = MarcaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)

    class Meta:
        model = Productos
        fields = [
            "id_prod", "nombre_prod", "marca", "categoria",
            "precio_venta", "precio_compra",
            "stock_min_prod", "stock_act_prod", "reposicion_prod",
            "stock_max_prod", "imagen_url"
        ]

class ProductosCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productos
        fields = [
            "id_prod", "nombre_prod", "marca", "categoria",
            "precio_venta", "precio_compra",
            "stock_min_prod", "stock_act_prod", "reposicion_prod",
            "stock_max_prod", "imagen_url"
        ]

    # --- CAMBIO ---
    # La función 'validate_imagen_url' se ha eliminado por completo.
    # --- FIN CAMBIO ---

class StockHistorySerializer(serializers.ModelSerializer):
    producto = serializers.StringRelatedField(read_only=True)
    usuario = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = StockHistory
        fields = [
            "id_history", "producto", "fecha_movimiento", "tipo_movimiento",
            "cantidad_movida", "stock_anterior", "stock_actual", "razon",
            "usuario"
        ]