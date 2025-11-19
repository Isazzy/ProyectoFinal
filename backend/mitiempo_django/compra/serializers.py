# compra/serializers.py (actualizado para usar update_stock del modelo Productos)

from rest_framework import serializers
from django.db import transaction
from .models import Proveedores, Compra, DetalleCompra  # Modelos adaptados
from productos.models import Productos  # Modelo de productos
from caja.models import Caja  # Modelo de caja
from django.contrib.auth.models import User

# --- Serializer para Proveedores (CRUD completo) ---
# (Sin cambios, ya está bien)

class ProveedoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedores
        fields = [
            'id_prov',
            'nombre_prov',
            'tipo_prov',
            'telefono',
            'correo',
            'direccion',
            'activo',
            'fecha_registro'
        ]
        extra_kwargs = {
            'tipo_prov': {'required': False, 'allow_blank': True, 'allow_null': True},
            'telefono': {'required': False, 'allow_blank': True, 'allow_null': True},
            'correo': {'required': False, 'allow_blank': True, 'allow_null': True},
            'direccion': {'required': False, 'allow_blank': True, 'allow_null': True},
            'activo': {'required': False},
            'fecha_registro': {'read_only': True},
        }

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        if 'tipo_prov' in internal_value and internal_value['tipo_prov'] == '':
            internal_value['tipo_prov'] = None
        if 'correo' in internal_value and internal_value['correo'] == '':
            internal_value['correo'] = None
        return internal_value

# --- Serializer para Detalle de Compra (Solo Escritura) ---
# (Sin cambios, ya está bien)

class DetalleCompraWriteSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Productos.objects.all())
    
    class Meta:
        model = DetalleCompra
        fields = ['producto', 'cantidad', 'precio_um']

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value

    def validate_precio_um(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio unitario debe ser mayor a 0.")
        return value

# --- Serializer para Crear Compra (Escritura) ---
# Actualizado: Ahora usa update_stock() del modelo Productos para registrar movimientos en StockHistory.

class CompraCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraWriteSerializer(many=True, write_only=True)
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedores.objects.all())
    metodo_pago = serializers.CharField(max_length=50, default='EFECTIVO')

    class Meta:
        model = Compra
        fields = ['proveedor', 'metodo_pago', 'detalles']

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("El usuario debe estar autenticado.")
        usuario = request.user

        try:
            caja_abierta = Caja.objects.get(caja_estado=True)
        except Caja.DoesNotExist:
            raise serializers.ValidationError("No se encontró una caja abierta. No se puede registrar la compra.")
        except Caja.MultipleObjectsReturned:
            raise serializers.ValidationError("Error: Hay múltiples cajas abiertas. Cierre la caja anterior.")

        detalles_data = validated_data.pop('detalles')
        if not detalles_data:
            raise serializers.ValidationError("La compra debe tener al menos un detalle.")

        compra_total = sum(
            item['cantidad'] * item['precio_um'] 
            for item in detalles_data
        )

        try:
            with transaction.atomic():
                compra = Compra.objects.create(
                    ro_usuario=usuario,
                    id_caja=caja_abierta.id_caja,
                    total_compra=compra_total,
                    estado='PENDIENTE',
                    **validated_data
                )

                detalles_compra_para_crear = []

                for item_data in detalles_data:
                    producto = item_data['producto']
                    cantidad = item_data['cantidad']
                    
                    detalles_compra_para_crear.append(
                        DetalleCompra(
                            id_compra=compra,
                            producto=producto,
                            cantidad=cantidad,
                            precio_um=item_data['precio_um']
                        )
                    )
                    
                    # Actualiza stock usando el método del modelo (registra en StockHistory)
                    producto.update_stock(
                        cantidad,  # Positivo para entrada
                        'ENTRADA',
                        usuario,
                        f'Compra #{compra.id_compra}'
                    )

                DetalleCompra.objects.bulk_create(detalles_compra_para_crear)
                return compra

        except Exception as e:
            raise serializers.ValidationError(f"Error al procesar la compra: {str(e)}")

# --- Serializers para Leer Compras (Lectura) ---
# (Sin cambios, ya está bien)

class DetalleCompraReadSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.StringRelatedField(source='producto.nombre_prod')
    producto_unidad = serializers.StringRelatedField(source='producto.unidad')

    class Meta:
        model = DetalleCompra
        fields = [
            'id_det_comp',
            'producto_nombre',
            'producto_unidad',
            'cantidad',
            'precio_um'
        ]

class CompraListSerializer(serializers.ModelSerializer):
    proveedor = serializers.StringRelatedField()
    ro_usuario = serializers.StringRelatedField()
    id_caja = serializers.IntegerField()
    detalles = DetalleCompraReadSerializer(many=True, read_only=True, source='detalles')

    class Meta:
        model = Compra
        fields = [
            'id_compra',
            'proveedor',
            'ro_usuario',
            'id_caja',
            'fecha_hs_comp',
            'total_compra',
            'metodo_pago',
            'estado',
            'detalles'
        ]