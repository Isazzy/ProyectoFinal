# venta/serializers.py (actualizado para usar update_stock del modelo Productos)

from rest_framework import serializers
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Ventas, DetVentas
from productos.models import Productos
from servicio.models import Servicio
from cajas.models import Cajas
from django.contrib.auth.models import User
from decimal import Decimal

# --- Serializer para Detalle de Venta (Solo Escritura) ---
# Actualizado: Ahora valida stock usando stock_act_prod del modelo.

class DetVentasWriteSerializer(serializers.ModelSerializer):
    id_prod = serializers.PrimaryKeyRelatedField(queryset=Productos.objects.all(), required=False, allow_null=True)
    id_serv = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = DetVentas
        fields = ['id_prod', 'id_serv', 'precio_unitario', 'cantidad_venta']

    def validate(self, data):
        if not data.get('id_prod') and not data.get('id_serv'):
            raise serializers.ValidationError("Cada detalle debe incluir al menos un producto o un servicio.")
        if data['cantidad_venta'] <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        if data['precio_unitario'] <= 0:
            raise serializers.ValidationError("El precio unitario debe ser mayor a 0.")
        # Valida stock disponible usando el campo correcto
        if data.get('id_prod'):
            if data['cantidad_venta'] > data['id_prod'].stock_act_prod:
                raise serializers.ValidationError(f"Stock insuficiente para {data['id_prod'].nombre_prod}. Disponible: {data['id_prod'].stock_act_prod}")
        return data

# --- Serializer para Crear Venta (Escritura) ---
# Actualizado: Ahora usa update_stock() del modelo Productos para registrar salidas en StockHistory.

class VentasCreateSerializer(serializers.ModelSerializer):
    detalles = DetVentasWriteSerializer(many=True, write_only=True)
    cliente = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='cliente'))
    
    class Meta:
        model = Ventas
        fields = ['cliente', 'tipo_venta', 'tipo_pago', 'detalles']

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("El usuario debe estar autenticado para registrar una venta.")
        usuario = request.user

        try:
            caja_abierta = Cajas.objects.get(estado='ABIERTA')
        except Cajas.DoesNotExist:
            raise serializers.ValidationError("No se encontró una caja abierta. No se puede registrar la venta.")
        except Cajas.MultipleObjectsReturned:
            raise serializers.ValidationError("Error: Hay múltiples cajas abiertas. Cierre la caja anterior.")

        detalles_data = validated_data.pop('detalles')
        if not detalles_data:
            raise serializers.ValidationError("La venta debe tener al menos un detalle.")

        total_venta = Decimal('0.00')
        for item in detalles_data:
            subtotal = item['precio_unitario'] * item['cantidad_venta']
            total_venta += subtotal

        try:
            with transaction.atomic():
                venta = Ventas.objects.create(
                    id_caja=caja_abierta,
                    total_venta=total_venta,
                    fech_hs_vent=validated_data.get('fech_hs_vent', None),
                    **validated_data
                )

                detalles_para_crear = []

                for item_data in detalles_data:
                    detalle = DetVentas(
                        id_venta=venta,
                        precio_unitario=item_data['precio_unitario'],
                        cantidad_venta=item_data['cantidad_venta'],
                        id_prod=item_data.get('id_prod'),
                        id_serv=item_data.get('id_serv')
                    )
                    detalles_para_crear.append(detalle)
                    
                    # Actualiza stock solo para productos usando el método del modelo
                    if item_data.get('id_prod'):
                        producto = item_data['id_prod']
                        producto.update_stock(
                            -item_data['cantidad_venta'],  # Negativo para salida
                            'SALIDA',
                            usuario,
                            f'Venta #{venta.id_venta}'
                        )

                DetVentas.objects.bulk_create(detalles_para_crear)
                return venta

        except Exception as e:
            raise serializers.ValidationError(f"Error al procesar la venta: {str(e)}")

# --- Serializers para Leer Ventas (Lectura) ---
# (Sin cambios, ya está bien)

class DetVentasReadSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.StringRelatedField(source='id_prod.nombre_prod', read_only=True)
    servicio_nombre = serializers.StringRelatedField(source='id_serv.nombre_serv', read_only=True)
    
    class Meta:
        model = DetVentas
        fields = [
            'id_det_venta',
            'producto_nombre',
            'servicio_nombre',
            'precio_unitario',
            'cantidad_venta',
            'subtotal'
        ]

class VentasListSerializer(serializers.ModelSerializer):
    cliente = serializers.StringRelatedField()
    id_caja = serializers.StringRelatedField()
    detalles = DetVentasReadSerializer(many=True, read_only=True, source='detventas_set')
    
    class Meta:
        model = Ventas
        fields = [
            'id_venta',
            'cliente',
            'id_caja',
            'fech_hs_vent',
            'tipo_venta',
            'total_venta',
            'tipo_pago',
            'detalles'
        ]