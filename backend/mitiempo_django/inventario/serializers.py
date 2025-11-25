# inventario/serializers.py
from rest_framework import serializers
from .models import Producto, Tipo_Producto, Categoria_Insumo, Insumo, Marca
import json

# --- SERIALIZERS DE LECTURA ---

class TipoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Producto
        fields = ["id", "tipo_producto_nombre", "activo"]


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ["id", "nombre", "activo"]


class ProductoSerializer(serializers.ModelSerializer):
    tipo_producto = serializers.StringRelatedField()
    tipo_producto_id = serializers.PrimaryKeyRelatedField(source="tipo_producto", read_only=True)
    marca = serializers.StringRelatedField()
    producto_imagen = serializers.ImageField(max_length=None, use_url=True, read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id",
            "producto_nombre",
            "producto_descripcion",
            "producto_precio",
            "stock",
            "stock_minimo",
            "producto_imagen",
            "producto_imagen_url",
            "tipo_producto",
            "tipo_producto_id",
            "marca",
            "activo",
            "producto_fecha_hora_creacion",
        ]


# --- SERIALIZERS DE ESCRITURA ---

class ProductoWriteSerializer(serializers.ModelSerializer):
    producto_imagen_url = serializers.URLField(required=False, allow_blank=True)
    producto_imagen = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = Producto
        fields = [
            "tipo_producto",
            "marca",
            "producto_nombre",
            "producto_descripcion",
            "producto_precio",
            "stock",
            "stock_minimo",
            "producto_imagen",
            "producto_imagen_url",
            "activo"
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy()
        
        # Limpieza de campos vacíos (convertir strings vacíos a None)
        for field in ["producto_imagen", "producto_imagen_url", "producto_descripcion"]:
            if field in mutable_data and isinstance(mutable_data[field], str) and not mutable_data[field]:
                mutable_data[field] = None

        # Convierte IDs de FK de string a int (manejo de FormData)
        for fk in ["tipo_producto", "marca"]:
            val = mutable_data.get(fk)
            if isinstance(val, str) and val.isdigit():
                mutable_data[fk] = int(val)
            elif val == "" or val == "null":
                mutable_data[fk] = None

        # Conversión segura de números (Stock y Precio)
        if 'stock' in mutable_data and mutable_data['stock']:
             mutable_data['stock'] = float(mutable_data['stock'])
        
        if 'stock_minimo' in mutable_data and mutable_data['stock_minimo']:
             mutable_data['stock_minimo'] = float(mutable_data['stock_minimo'])
             
        if 'producto_precio' in mutable_data and mutable_data['producto_precio']:
             mutable_data['producto_precio'] = float(mutable_data['producto_precio'])

        # Manejo de booleano 'activo' desde FormData
        activo_val = mutable_data.get("activo")
        if isinstance(activo_val, str):
            mutable_data["activo"] = activo_val.lower() in ("true", "on", "1")

        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        # Prioridad URL sobre Archivo físico (Lógica Cloudinary)
        if validated_data.get("producto_imagen_url"):
            validated_data["producto_imagen"] = None
        elif validated_data.get("producto_imagen"):
            validated_data["producto_imagen_url"] = None

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prioridad URL sobre Archivo físico
        if validated_data.get("producto_imagen_url"):
            validated_data["producto_imagen"] = None
            # Si existía una imagen física anterior, se desvincula aquí
            instance.producto_imagen.delete(save=False)
        elif validated_data.get("producto_imagen"):
            validated_data["producto_imagen_url"] = None
            instance.producto_imagen.delete(save=False)

        return super().update(instance, validated_data)


# --- SERIALIZERS DE INSUMOS ---

class CategoriaInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria_Insumo
        fields = ["id", "categoria_insumo_nombre", "activo"]


class InsumoReadSerializer(serializers.ModelSerializer):
    categoria_insumo = serializers.StringRelatedField()
    marca = serializers.StringRelatedField()
    insumo_imagen = serializers.ImageField(max_length=None, use_url=True, read_only=True)

    class Meta:
        model = Insumo
        fields = [
            "id",
            "categoria_insumo",
            "insumo_nombre",
            "insumo_unidad",
            "insumo_stock",
            "insumo_stock_minimo",
            "marca",
            "insumo_imagen",
            "insumo_imagen_url",
            "activo"
        ]


class InsumoWriteSerializer(serializers.ModelSerializer):
    insumo_imagen_url = serializers.URLField(required=False, allow_blank=True)
    insumo_imagen = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Insumo
        fields = [
            "categoria_insumo",
            "marca",
            "insumo_nombre",
            "insumo_unidad",
            "insumo_stock",
            "insumo_stock_minimo",
            "insumo_imagen",
            "insumo_imagen_url",
            "activo"
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy()
        
        for field in ["insumo_imagen", "insumo_imagen_url"]:
            if field in mutable_data and isinstance(mutable_data[field], str) and not mutable_data[field]:
                mutable_data[field] = None
        
        for fk in ["categoria_insumo", "marca"]:
            val = mutable_data.get(fk)
            if isinstance(val, str) and val.isdigit():
                mutable_data[fk] = int(val)
            elif val == "" or val == "null":
                mutable_data[fk] = None
        
        # Manejo de booleano 'activo'
        activo_val = mutable_data.get("activo")
        if isinstance(activo_val, str):
            mutable_data["activo"] = activo_val.lower() in ("true", "on", "1")

        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        if validated_data.get("insumo_imagen_url"):
            validated_data["insumo_imagen"] = None
        elif validated_data.get("insumo_imagen"):
            validated_data["insumo_imagen_url"] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("insumo_imagen_url"):
            validated_data["insumo_imagen"] = None
            instance.insumo_imagen.delete(save=False)
        elif validated_data.get("insumo_imagen"):
            validated_data["insumo_imagen_url"] = None
            instance.insumo_imagen.delete(save=False)
        return super().update(instance, validated_data)