from rest_framework import serializers
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal
from .models import Caja
from empleado.serializers import EmpleadoNestedSerializer
from ventas.models import Venta
from compras.models import Compra
from movimiento_caja.models import Ingreso, Egreso

class CajaListSerializer(serializers.ModelSerializer):
    """ 
    Serializer para listar el historial de Cajas.
    """
    empleado = EmpleadoNestedSerializer(source='empleado.user', read_only=True)
    
    # --- CAMPOS CALCULADOS ---
    total_ventas_efectivo = serializers.SerializerMethodField()
    total_ventas_transferencia = serializers.SerializerMethodField()
    total_compras_efectivo = serializers.SerializerMethodField()
    total_compras_transferencia = serializers.SerializerMethodField()
    total_ingresos_manuales = serializers.SerializerMethodField()
    total_egresos_manuales = serializers.SerializerMethodField()
    saldo_calculado_efectivo = serializers.SerializerMethodField()
    saldo_calculado_transferencia = serializers.SerializerMethodField()

    class Meta:
        model = Caja
        fields = [
            'id', 'empleado', 'caja_estado', 'caja_monto_inicial', 
            'caja_saldo_final', 'caja_fecha_hora_apertura', 
            'caja_fecha_hora_cierre', 'caja_observacion',
            'total_ventas_efectivo', 'total_ventas_transferencia',
            'total_compras_efectivo', 'total_compras_transferencia',
            'total_ingresos_manuales', 'total_egresos_manuales',
            'saldo_calculado_efectivo', 'saldo_calculado_transferencia'
        ]
        
    def get_total_ventas_efectivo(self, obj):
        total = Venta.objects.filter(
            caja=obj, 
            estado_venta__estado_venta_nombre='Pagado', # <-- CORREGIDO
            venta_medio_pago='efectivo'
        ).aggregate(total=Sum('venta_total'))['total']
        return total or Decimal('0.00')

    def get_total_ventas_transferencia(self, obj):
        total = Venta.objects.filter(
            caja=obj, 
            estado_venta__estado_venta_nombre='Pagado', # <-- CORREGIDO
            venta_medio_pago='transferencia'
        ).aggregate(total=Sum('venta_total'))['total']
        return total or Decimal('0.00')

    def get_total_compras_efectivo(self, obj):
        total = Compra.objects.filter(
            caja=obj,
            compra_metodo_pago='efectivo'
        ).aggregate(total=Sum('compra_total'))['total']
        return total or Decimal('0.00')
        
    def get_total_compras_transferencia(self, obj):
        total = Compra.objects.filter(
            caja=obj,
            compra_metodo_pago='transferencia'
        ).aggregate(total=Sum('compra_total'))['total']
        return total or Decimal('0.00')
        
    def get_total_ingresos_manuales(self, obj):
        total = Ingreso.objects.filter(
            caja=obj
        ).aggregate(total=Sum('ingreso_monto'))['total']
        return total or Decimal('0.00')
        
    def get_total_egresos_manuales(self, obj):
        total = Egreso.objects.filter(
            caja=obj
        ).aggregate(total=Sum('egreso_monto'))['total']
        return total or Decimal('0.00')

    def get_saldo_calculado_efectivo(self, obj):
        monto_inicial = obj.caja_monto_inicial
        total_ventas = self.get_total_ventas_efectivo(obj)
        total_ingresos = self.get_total_ingresos_manuales(obj)
        total_compras = self.get_total_compras_efectivo(obj)
        total_egresos = self.get_total_egresos_manuales(obj)
        
        return (monto_inicial + total_ventas + total_ingresos) - (total_compras + total_egresos)

    def get_saldo_calculado_transferencia(self, obj):
        total_ventas = self.get_total_ventas_transferencia(obj)
        total_compras = self.get_total_compras_transferencia(obj)
        
        return total_ventas - total_compras

# --- Serializer de Apertura ---
class CajaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = ['caja_monto_inicial']
        extra_kwargs = {
            'caja_monto_inicial': {'required': False}
        }

# --- Serializer de Cierre ---
class CajaCloseSerializer(serializers.ModelSerializer):
    caja_observacion = serializers.CharField(required=False, allow_blank=True, max_length=400)

    class Meta:
        model = Caja
        fields = ['caja_observacion','caja_saldo_final']
        read_only_fields = [
            'caja_saldo_final', 'caja_fecha_hora_cierre', 'caja_estado'
        ]

    def update(self, instance, validated_data):
        monto_inicial = instance.caja_monto_inicial
        
        
        ventas_efectivo = Venta.objects.filter(
            caja=instance, 
            estado_venta__estado_venta_nombre='Pagado', # <-- CORREGIDO
            venta_medio_pago='efectivo'
        ).aggregate(total=Sum('venta_total'))['total'] or Decimal('0.00')
        
        ingresos_extra = Ingreso.objects.filter(
            caja=instance
        ).aggregate(total=Sum('ingreso_monto'))['total'] or Decimal('0.00')

        compras_efectivo = Compra.objects.filter(
            caja=instance,
            compra_metodo_pago='efectivo'
        ).aggregate(total=Sum('compra_total'))['total'] or Decimal('0.00')
        
        egresos_extra = Egreso.objects.filter(
            caja=instance
        ).aggregate(total=Sum('egreso_monto'))['total'] or Decimal('0.00')

        saldo_calculado = (monto_inicial + ventas_efectivo + ingresos_extra) - (compras_efectivo + egresos_extra)

        instance.caja_saldo_final = saldo_calculado
        instance.caja_observacion = validated_data.get('caja_observacion', instance.caja_observacion)
        instance.caja_estado = False 
        instance.caja_fecha_hora_cierre = timezone.now()
        
        instance.save()
        return instance