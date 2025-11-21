# inventario/serializers.py
from rest_framework import serializers
from .models import Producto, Tipo_Producto, Categoria_Insumo, Insumo, Producto_X_Insumo
import json


# --- SERIALIZERS DE LECTURA ---

class TipoProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Producto
        fields = ["id", "tipo_producto_nombre"]


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto._meta.get_field('marca').related_model
        fields = ["id", "nombre"]


class InsumoEnRecetaSerializer(serializers.ModelSerializer):
    insumo_imagen = serializers.ImageField(max_length=None, use_url=True, read_only=True)
    marca = serializers.StringRelatedField()

    class Meta:
        model = Insumo
        fields = [
            "id",
            "insumo_nombre",
            "insumo_unidad",
            "insumo_imagen",
            "insumo_imagen_url",
            "marca",
        ]


class ProductoXInsumoReadSerializer(serializers.ModelSerializer):
    insumo = InsumoEnRecetaSerializer()

    class Meta:
        model = Producto_X_Insumo
        fields = ["insumo", "producto_insumo_cantidad"]


class ProductoSerializer(serializers.ModelSerializer):
    tipo_producto = serializers.StringRelatedField()
    tipo_producto_id = serializers.PrimaryKeyRelatedField(source="tipo_producto", read_only=True)
    marca = serializers.StringRelatedField()
    producto_imagen = serializers.ImageField(max_length=None, use_url=True, read_only=True)
    receta = ProductoXInsumoReadSerializer(many=True, source="receta", read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id",
            "producto_nombre",
            "producto_descripcion",
            "producto_precio",
            "producto_disponible",
            "producto_imagen",
            "producto_imagen_url",
            "tipo_producto",
            "tipo_producto_id",
            "marca",
            "receta",
            "producto_fecha_hora_creacion",
        ]


# --- SERIALIZERS DE ESCRITURA ---

class RecetaWriteSerializer(serializers.Serializer):
    insumo_id = serializers.IntegerField()
    cantidad = serializers.DecimalField(max_digits=12, decimal_places=3)


class ProductoWriteSerializer(serializers.ModelSerializer):
    producto_imagen = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)
    receta = RecetaWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Producto
        fields = [
            "tipo_producto",
            "marca",
            "producto_nombre",
            "producto_descripcion",
            "producto_precio",
            "producto_disponible",
            "producto_imagen",
            "producto_imagen_url",
            "receta",
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy()
        for field in ["producto_imagen", "producto_imagen_url", "producto_descripcion"]:
            if field in mutable_data and isinstance(mutable_data[field], str) and not mutable_data[field]:
                mutable_data[field] = None

        # Convierte "producto_disponible" de string a boolean
        disp = mutable_data.get("producto_disponible")
        if isinstance(disp, str):
            mutable_data["producto_disponible"] = disp.lower() in ("true", "on")

        # Convierte IDs de FK de string a int
        for fk in ["tipo_producto", "marca"]:
            if isinstance(mutable_data.get(fk), str) and mutable_data[fk].isdigit():
                mutable_data[fk] = int(mutable_data[fk])

        # Convierte receta JSON string a lista si viene de FormData
        receta_str = mutable_data.get("receta")
        if isinstance(receta_str, str):
            try:
                mutable_data["receta"] = json.loads(receta_str)
            except json.JSONDecodeError:
                pass

        return super().to_internal_value(mutable_data)

    def _guardar_receta(self, producto, receta_data):
        producto.receta.all().delete()
        for item in receta_data:
            insumo = Insumo.objects.get(id=item["insumo_id"])
            Producto_X_Insumo.objects.create(
                producto=producto,
                insumo=insumo,
                producto_insumo_cantidad=item["cantidad"],
            )

    def create(self, validated_data):
        receta_data = validated_data.pop("receta", [])
        if validated_data.get("producto_imagen"):
            validated_data["producto_imagen_url"] = None
        elif validated_data.get("producto_imagen_url"):
            validated_data["producto_imagen"] = None

        producto = super().create(validated_data)
        self._guardar_receta(producto, receta_data)
        return producto

    def update(self, instance, validated_data):
        receta_data = validated_data.pop("receta", None)

        # Manejo de imágenes
        if validated_data.get("producto_imagen") is not None:
            validated_data["producto_imagen_url"] = None
            instance.producto_imagen.delete(save=False)
        elif validated_data.get("producto_imagen_url") is not None:
            validated_data["producto_imagen"] = None
            instance.producto_imagen.delete(save=False)

        producto = super().update(instance, validated_data)
        if receta_data is not None:
            self._guardar_receta(producto, receta_data)
        return producto


# --- SERIALIZERS DE INSUMOS ---

class CategoriaInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria_Insumo
        fields = ["id", "categoria_insumo_nombre"]


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
        ]


class InsumoWriteSerializer(serializers.ModelSerializer):
    insumo_imagen = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)

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
        ]

    def to_internal_value(self, data):
        mutable_data = data.copy()
        for field in ["insumo_imagen", "insumo_imagen_url"]:
            if field in mutable_data and isinstance(mutable_data[field], str) and not mutable_data[field]:
                mutable_data[field] = None
        for fk in ["categoria_insumo", "marca"]:
            if isinstance(mutable_data.get(fk), str) and mutable_data[fk].isdigit():
                mutable_data[fk] = int(mutable_data[fk])
        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        if validated_data.get("insumo_imagen"):
            validated_data["insumo_imagen_url"] = None
        elif validated_data.get("insumo_imagen_url"):
            validated_data["insumo_imagen"] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("insumo_imagen") is not None:
            validated_data["insumo_imagen_url"] = None
            instance.insumo_imagen.delete(save=False)
        elif validated_data.get("insumo_imagen_url") is not None:
            validated_data["insumo_imagen"] = None
            instance.insumo_imagen.delete(save=False)
        return super().update(instance, validated_data)
