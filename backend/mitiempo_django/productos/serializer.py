# productos/serializers.py
from rest_framework import serializers
from .models import Productos, Marca, Categoria

class MarcaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Marca."""
    class Meta:
        model = Marca
        fields = '__all__'  # Incluye id_marca y nombre

class CategoriaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Categoria."""
    class Meta:
        model = Categoria
        fields = '__all__' # Incluye id_categoria, nombre y descripcion

class ProductosSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Productos."""
    
    # Opcional: Muestra los nombres de marca y categoría (en vez de solo el ID)
    # en las peticiones GET, lo que hace la API más fácil de leer.
    marca = MarcaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    
    # Campos para escribir (POST/PUT) usando solo el ID
    marca_id = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(), source='marca', write_only=True, allow_null=True, required=False
    )
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True, allow_null=True, required=False
    )

    class Meta:
        model = Productos
        fields = [
            'id_prod', 
            'nombre_prod', 
            'marca',          # Para leer (GET)
            'marca_id',       # Para escribir (POST/PUT)
            'categoria',      # Para leer (GET)
            'categoria_id',   # Para escribir (POST/PUT)
            'precio_venta', 
            'precio_compra', 
            'stock_min_prod', 
            'stock_act_prod', 
            'reposicion_prod', 
            'stock_max_prod'
        ]
        
        # Hacemos 'stock_act_prod' de solo lectura.
        # El stock solo debe modificarse mediante Compras, Ventas o Ajustes manuales,
        # no editando directamente el producto.
        read_only_fields = ('stock_act_prod',)

class StockAjusteSerializer(serializers.Serializer):
    """
    Serializer simple para validar la data de un ajuste de stock.
    No está atado a un modelo.
    """
    cantidad = serializers.IntegerField(
        help_text="La cantidad a mover (ej: 10 para entrada, -5 para salida)"
    )
    razon = serializers.CharField(max_length=255, allow_blank=True, required=False)