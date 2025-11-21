from rest_framework import serializers
from django.db import transaction
from django.db.models import F
from .models import Proveedor, Compra, Detalle_Compra
from inventario.models import Insumo
from caja.models import Caja
from empleado.serializers import EmpleadoNestedSerializer
from django.contrib.auth.models import User

# --- Serializer para Proveedor (CRUD completo) ---
class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = [
            'id', 
            'proveedor_dni', 
            'proveedor_nombre', 
            'proveedor_direccion', 
            'proveedor_telefono', 
            'proveedor_email'
        ]
        extra_kwargs = {
            'proveedor_direccion': {'required': False, 'allow_blank': True, 'allow_null': True},
            'proveedor_email': {'required': False, 'allow_blank': True, 'allow_null': True},
            'proveedor_dni': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        if 'proveedor_dni' in internal_value and internal_value['proveedor_dni'] == '':
            internal_value['proveedor_dni'] = None
        if 'proveedor_email' in internal_value and internal_value['proveedor_email'] == '':
             internal_value['proveedor_email'] = None
        return internal_value


# --- Serializer para Detalle de Compra (Solo Escritura) ---
class DetalleCompraWriteSerializer(serializers.ModelSerializer):
    insumo = serializers.PrimaryKeyRelatedField(queryset=Insumo.objects.all())
    
    class Meta:
        model = Detalle_Compra
        fields = ['insumo', 'detalle_compra_cantidad', 'detalle_compra_precio_unitario']

# --- Serializer para Crear Compra (Escritura) ---
class CompraCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraWriteSerializer(many=True, write_only=True)
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.all())
    compra_metodo_pago = serializers.ChoiceField(choices=Compra.metodo_pago)

    class Meta:
        model = Compra
        fields = ['proveedor', 'compra_metodo_pago', 'detalles']

    def create(self, validated_data):
        request = self.context.get('request')
        if not hasattr(request.user, 'empleado'):
            raise serializers.ValidationError("El usuario no tiene un perfil de empleado asociado.")
        empleado = request.user.empleado

        # 2. Obtener la caja activa
        try:
            # --- INICIO DE LA CORRECCIÓN ---
            # Buscamos LA caja abierta, sin importar el empleado
            caja_abierta = Caja.objects.get(caja_estado=True)
            # --- FIN DE LA CORRECCIÓN ---

        except Caja.DoesNotExist:
            raise serializers.ValidationError("No se encontró una caja abierta. No se puede registrar la compra.")
        except Caja.MultipleObjectsReturned:
            # Esto pasa si olvidaste cerrar una caja anterior.
            raise serializers.ValidationError("Error: Hay múltiples cajas abiertas. Cierre la caja anterior antes de registrar una compra.")

        detalles_data = validated_data.pop('detalles')
        if not detalles_data:
            raise serializers.ValidationError("La compra debe tener al menos un detalle.")

        compra_total = sum(
            item['detalle_compra_cantidad'] * item['detalle_compra_precio_unitario'] 
            for item in detalles_data
        )

        try:
            with transaction.atomic():
                compra = Compra.objects.create(
                    empleado=empleado,
                    caja=caja_abierta, # Asigna la caja única abierta
                    compra_total=compra_total,
                    **validated_data
                )

                detalles_compra_para_crear = []
                insumos_para_actualizar = []

                for item_data in detalles_data:
                    insumo = item_data['insumo']
                    cantidad = item_data['detalle_compra_cantidad']
                    
                    detalles_compra_para_crear.append(
                        Detalle_Compra(
                            compra=compra,
                            **item_data
                        )
                    )
                    
                    insumo.insumo_stock = F('insumo_stock') + cantidad
                    insumos_para_actualizar.append(insumo)

                Detalle_Compra.objects.bulk_create(detalles_compra_para_crear)
                Insumo.objects.bulk_update(insumos_para_actualizar, ['insumo_stock'])

                return compra

        except Exception as e:
            raise serializers.ValidationError(f"Error al procesar la compra y el stock: {str(e)}")


# --- Serializers para Leer Compras (Lectura) ---
class DetalleCompraReadSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.StringRelatedField(source='insumo.insumo_nombre')
    insumo_unidad = serializers.StringRelatedField(source='insumo.insumo_unidad')

    class Meta:
        model = Detalle_Compra
        fields = [
            'id', 
            'insumo_nombre', 
            'insumo_unidad', 
            'detalle_compra_cantidad', 
            'detalle_compra_precio_unitario'
        ]

class CompraListSerializer(serializers.ModelSerializer):
    proveedor = serializers.StringRelatedField()
    empleado = EmpleadoNestedSerializer(source='empleado.user', read_only=True)
    caja = serializers.StringRelatedField()
    detalles = DetalleCompraReadSerializer(many=True, read_only=True, source='detalle_compra_set')

    class Meta:
        model = Compra
        fields = [
            'id', 
            'proveedor', 
            'empleado', 
            'caja', 
            'compra_fecha_hora', 
            'compra_total', 
            'compra_metodo_pago',
            'detalles'
        ]