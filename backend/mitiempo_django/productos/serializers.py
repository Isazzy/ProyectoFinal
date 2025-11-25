# productos/serializers.py

__all__ = [
    "ProveedorSerializer",
    "MarcaSerializer",
    "CategoriaSerializer",
    "ProductosSerializer",
    "ProductoStockAjusteSerializer",
    "StockAjusteSerializer",
    "ProductosCreateUpdateSerializer",
    "StockHistorySerializer",
]

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Marca, Categoria, Productos, Proveedores,
    ProductosXProveedores, DetVentas, DetCompras, StockHistory
)

User = get_user_model()


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedores
        fields = '__all__'


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ["id_marca", "nombre"]


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id_categoria", "nombre", "descripcion"]


class ProductosSerializer(serializers.ModelSerializer):
    """
    Serializer de lectura para Productos: incluye datos anidados de marca y categoría.
    """
    marca = MarcaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)

    # Campos para escribir (POST/PUT) usando solo el ID
    marca_id = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(),
        source='marca',
        write_only=True,
        allow_null=True,
        required=False
    )
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Productos
        fields = [
            "id_prod", "nombre_prod", "marca", "categoria",
            "precio_venta", "precio_compra",
            "stock_min_prod", "stock_act_prod", "reposicion_prod",
            "stock_max_prod", "imagen_url",
            # write-only ids
            "marca_id", "categoria_id",
        ]
        read_only_fields = ["id_prod"]


class ProductoStockAjusteSerializer(serializers.Serializer):
    """
    Serializer para operaciones puntuales de ajuste de stock (no-model serializer).
    delta: entero (positivo para entrada, negativo para salida)
    motivo: texto opcional
    """
    delta = serializers.IntegerField()
    motivo = serializers.CharField(required=False, allow_blank=True)


class StockAjusteSerializer(serializers.Serializer):
    """
    Serializer simple alternativo para validación de ajustes (cantidad + razón).
    """
    cantidad = serializers.IntegerField(
        help_text="La cantidad a mover (ej: 10 para entrada, -5 para salida)"
    )
    razon = serializers.CharField(max_length=255, allow_blank=True, required=False)


class ProductosCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para creación/actualización de Productos (usa ids de marca/categoría)
    """
    marca_id = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(),
        source='marca',
        write_only=True,
        allow_null=True,
        required=False
    )
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Productos
        fields = [
            "id_prod", "nombre_prod", "marca", "categoria",
            "precio_venta", "precio_compra",
            "stock_min_prod", "stock_act_prod", "reposicion_prod",
            "stock_max_prod", "imagen_url"
        ]
        read_only_fields = ["id_prod"]


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
