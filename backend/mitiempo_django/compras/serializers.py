from rest_framework import serializers
from django.db import transaction
from django.db.models import F
from .models import Proveedor, Compra, Detalle_Compra
from inventario.models import Insumo , Producto
from caja.models import Caja
from empleado.serializers import EmpleadoNestedSerializer
from django.contrib.auth.models import User
from django.utils import timezone # Necesario para validaciones de fecha/hora si se envían
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
        # Limpieza de strings vacíos a None (para campos null=True)
        for field in ['proveedor_dni', 'proveedor_email', 'proveedor_direccion']:
            if field in internal_value and internal_value[field] == '':
                 internal_value[field] = None
        return internal_value


# --- Serializer para Detalle de Compra (Solo Escritura) ---
class DetalleCompraWriteSerializer(serializers.ModelSerializer):
    # Ambos campos son opcionales en la entrada, validamos después
    insumo_id = serializers.IntegerField(required=False, allow_null=True)
    producto_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Detalle_Compra
        fields = ['insumo_id', 'producto_id', 'detalle_compra_cantidad', 'detalle_compra_precio_unitario']

    def validate(self, data):
        # Validar exclusividad
        insumo = data.get('insumo_id')
        producto = data.get('producto_id')
        
        if not insumo and not producto:
            raise serializers.ValidationError("Debe especificar 'insumo_id' o 'producto_id'.")
        if insumo and producto:
            raise serializers.ValidationError("No puede comprar un Insumo y un Producto en la misma línea.")
        return data
# --- Serializer para Crear Compra (Escritura) ---
class CompraCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraWriteSerializer(many=True, write_only=True)
    proveedor = serializers.PrimaryKeyRelatedField(queryset=Proveedor.objects.all())
    compra_metodo_pago = serializers.ChoiceField(choices=Compra.metodo_pago)
    
    # NUEVOS CAMPOS: Permitimos que se envíen, aunque el modelo los auto-asigna
    compra_fecha = serializers.DateField(required=False, write_only=True)
    compra_hora = serializers.TimeField(required=False, write_only=True)

    class Meta:
        model = Compra
        fields = ['proveedor', 'compra_metodo_pago', 'detalles', 'compra_fecha', 'compra_hora']
        
    def validate(self, data):
        # ... (Validaciones de caja y empleado) ...
        if not Caja.objects.filter(caja_estado=True).exists():
            raise serializers.ValidationError("No se encontró una caja abierta. No se puede registrar la compra.")
        
        detalles_data = data.get('detalles')
        if not detalles_data:
            raise serializers.ValidationError("La compra debe tener al menos un detalle.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        
        if not hasattr(request.user, 'empleado'):
            raise serializers.ValidationError("El usuario no tiene un perfil de empleado asociado.")
        empleado = request.user.empleado

        caja_abierta = Caja.objects.filter(caja_estado=True).first()
        if not caja_abierta:
            raise serializers.ValidationError("No hay caja abierta.")

        detalles_data = validated_data.pop('detalles')
        if not detalles_data:
            raise serializers.ValidationError("La compra está vacía.")
        
        # 2. Calcular total
        compra_total = sum(
            item['detalle_compra_cantidad'] * item['detalle_compra_precio_unitario'] 
            for item in detalles_data
        )

        try:
            with transaction.atomic():
                # 1. Crear Compra
                compra = Compra.objects.create(
                    empleado=empleado,
                    caja=caja_abierta,
                    compra_total=compra_total,
                    **validated_data
                )

                detalles_objs = []
                
                # 2. Iterar detalles y actualizar stocks según tipo
                for item in detalles_data:
                    insumo_id = item.get('insumo_id')
                    producto_id = item.get('producto_id')
                    cantidad = item['detalle_compra_cantidad']
                    precio = item['detalle_compra_precio_unitario']
                    
                    if insumo_id:
                        # Es un INSUMO
                        insumo = Insumo.objects.select_for_update().get(id=insumo_id)
                        insumo.insumo_stock = F('insumo_stock') + cantidad
                        insumo.save()
                        
                        detalles_objs.append(Detalle_Compra(
                            compra=compra,
                            insumo=insumo,
                            producto=None,
                            detalle_compra_cantidad=cantidad,
                            detalle_compra_precio_unitario=precio
                        ))
                    
                    elif producto_id:
                        # Es un PRODUCTO
                        producto = Producto.objects.select_for_update().get(id=producto_id)
                        producto.stock = F('stock') + cantidad # Usamos campo 'stock' del modelo Producto
                        producto.save()

                        detalles_objs.append(Detalle_Compra(
                            compra=compra,
                            insumo=None,
                            producto=producto,
                            detalle_compra_cantidad=cantidad,
                            detalle_compra_precio_unitario=precio
                        ))

                # Guardar detalles en lote
                Detalle_Compra.objects.bulk_create(detalles_objs)
                
                # 3. Descontar de Caja si es efectivo
                if compra.compra_metodo_pago == 'efectivo':
                    caja_abierta.caja_saldo_final -= compra_total
                    caja_abierta.save()
                    
                return compra

        except Exception as e:
            raise serializers.ValidationError(f"Error procesando compra: {str(e)}")

# --- Serializers para Leer Compras (Lectura) ---
class DetalleCompraReadSerializer(serializers.ModelSerializer):
    # Campos calculados para mostrar info genérica sea insumo o producto
    item_nombre = serializers.SerializerMethodField()
    item_tipo = serializers.SerializerMethodField()
    unidad = serializers.SerializerMethodField()

    class Meta:
        model = Detalle_Compra
        fields = [
            'id', 
            'item_nombre', 
            'item_tipo', 
            'unidad',
            'detalle_compra_cantidad', 
            'detalle_compra_precio_unitario'
        ]
    def get_item_nombre(self, obj):
        if obj.insumo: return obj.insumo.insumo_nombre
        if obj.producto: return obj.producto.producto_nombre
        return "Desconocido"

    def get_item_tipo(self, obj):
        if obj.insumo: return "Insumo"
        if obj.producto: return "Producto"
        return "-"

    def get_unidad(self, obj):
        if obj.insumo: return obj.insumo.insumo_unidad
        if obj.producto: return "unidades" # Productos de reventa suelen ser por unidad
        return ""

class CompraListSerializer(serializers.ModelSerializer):
    proveedor = serializers.StringRelatedField()
    # Empleado Nested para mostrar el nombre/datos del usuario que registró la compra
    empleado = EmpleadoNestedSerializer(source='empleado.user', read_only=True)
    caja = serializers.StringRelatedField()
    detalles = DetalleCompraReadSerializer(many=True, read_only=True, source='detalle_compra_set')
    compra_fecha = serializers.DateField(read_only=True)
    compra_hora = serializers.TimeField(read_only=True)
    class Meta:
        model = Compra
        fields = [
            'id', 
            'proveedor', 
            'empleado', 
            'caja', 
            'compra_fecha', 'compra_hora',
            'compra_total', 
            'compra_metodo_pago',
            'detalles'
        ]
    class CompraListSerializer(serializers.ModelSerializer):
        proveedor = serializers.StringRelatedField()
        empleado = EmpleadoNestedSerializer(source='empleado.user', read_only=True)
        caja = serializers.StringRelatedField()
        detalles = DetalleCompraReadSerializer(many=True, read_only=True, source='detalle_compra_set')
        
        compra_fecha = serializers.DateField(read_only=True)
        compra_hora = serializers.TimeField(read_only=True)

        class Meta:
            model = Compra
            fields = [
                'id', 'proveedor', 'empleado', 'caja', 
                'compra_fecha', 'compra_hora', 
                'compra_total', 'compra_metodo_pago',
                'detalles'
            ]
