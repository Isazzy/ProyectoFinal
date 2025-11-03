from rest_framework import serializers
<<<<<<< HEAD
<<<<<<< HEAD
from .models import Productos, Proveedores, ProductosXProveedores, DetVentas, DetCompras

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedores
        fields = '__all__'
=======
from .models import Productos, Marca, Categoria
=======
from .models import Marca, Categoria, Productos, StockHistory
>>>>>>> 67ec8a26 (Producto terminado (Creo))

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
<<<<<<< HEAD
    
    # Campos para escribir (POST/PUT) usando solo el ID
    marca_id = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(), source='marca', write_only=True, allow_null=True, required=False
    )
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True, allow_null=True, required=False
    )
>>>>>>> 874e3164 (reestructuracion de archivos)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))

class ProductoSerializer(serializers.ModelSerializer):
    proveedor_ids = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, source='proveedor_rel'
    )
    class Meta:
        model = Productos
<<<<<<< HEAD
        fields = '__all__'

class ProductoStockAjusteSerializer(serializers.Serializer):
    delta = serializers.IntegerField()  # positivo suma stock, negativo descuenta
    motivo = serializers.CharField(required=False, allow_blank=True)
=======
        fields = [
            "id_prod", "nombre_prod", "marca", "categoria",
            "precio_venta", "precio_compra",
            "stock_min_prod", "stock_act_prod", "reposicion_prod",
            "stock_max_prod", "imagen_url"
        ]

<<<<<<< HEAD
class StockAjusteSerializer(serializers.Serializer):
    """
    Serializer simple para validar la data de un ajuste de stock.
    No está atado a un modelo.
    """
    cantidad = serializers.IntegerField(
        help_text="La cantidad a mover (ej: 10 para entrada, -5 para salida)"
    )
    razon = serializers.CharField(max_length=255, allow_blank=True, required=False)
>>>>>>> 874e3164 (reestructuracion de archivos)
=======
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
>>>>>>> 67ec8a26 (Producto terminado (Creo))
