from rest_framework import serializers
from .models import Caja
from caja_registro.models import Transaccion  # Asume que tienes este modelo en caja_registro

class TransaccionSerializer(serializers.ModelSerializer):
    # Serializer anidado para mostrar transacciones (opcional, si quieres incluirlas en la respuesta)
    class Meta:
        model = Transaccion
        fields = ['id', 'tipo', 'descripcion', 'monto', 'fecha', 'usuario', 'cliente']

class CajaSerializer(serializers.ModelSerializer):
    # Campos calculados para integración con transacciones
    total_ingresos = serializers.SerializerMethodField(read_only=True, help_text="Total de ingresos (ventas + servicios) de la caja.")
    total_egresos = serializers.SerializerMethodField(read_only=True, help_text="Total de egresos (compras) de la caja.")
    saldo_calculado = serializers.SerializerMethodField(read_only=True, help_text="Saldo calculado: inicial + ingresos - egresos.")
    transacciones = TransaccionSerializer(many=True, read_only=True, source='transacciones')  # Lista de transacciones anidadas
    
    class Meta:
        model = Caja
        fields = [
            'id', 'usuario', 'caja_estado', 'caja_monto_inicial', 'caja_saldo_final',
            'caja_fecha_hora_apertura', 'caja_fecha_hora_cierre', 'caja_observacion',
            'total_ingresos', 'total_egresos', 'saldo_calculado', 'transacciones'
        ]
        read_only_fields = ('caja_fecha_hora_apertura', 'caja_fecha_hora_cierre', 'total_ingresos', 'total_egresos', 'saldo_calculado')
    
    def get_total_ingresos(self, obj):
        # Calcula total de ingresos (ventas + servicios)
        return obj.transacciones.filter(tipo__in=['venta', 'servicio']).aggregate(total=models.Sum('monto'))['total'] or 0
    
    def get_total_egresos(self, obj):
        # Calcula total de egresos (compras)
        return obj.transacciones.filter(tipo='compra').aggregate(total=models.Sum('monto'))['total'] or 0
    
    def get_saldo_calculado(self, obj):
        # Saldo real: inicial + ingresos - egresos
        ingresos = self.get_total_ingresos(obj)
        egresos = self.get_total_egresos(obj)
        return obj.caja_monto_inicial + ingresos - egresos
    
    def validate(self, data):
        user = self.context['request'].user
        
        # Regla: Solo el usuario asignado o un admin puede modificar
        if self.instance and self.instance.usuario != user and user.role != 'admin':
            raise serializers.ValidationError("No tienes permisos para modificar esta caja.")
        
        # Regla: No permitir abrir caja si ya tienes una abierta
        if not self.instance and Caja.objects.filter(usuario=user, caja_estado=True).exists():
            raise serializers.ValidationError("Ya tienes una caja abierta.")
        
        # Regla: Al cerrar, calcular y validar saldo final basado en transacciones
        if 'caja_estado' in data and not data['caja_estado']:
            saldo_calculado = self.get_saldo_calculado(self.instance) if self.instance else 0
            saldo_proporcionado = data.get('caja_saldo_final')
            if saldo_proporcionado is not None and saldo_proporcionado != saldo_calculado:
                raise serializers.ValidationError(f"El saldo final debe coincidir con el calculado ({saldo_calculado}).")
            # Si no se proporciona, asignar el calculado
            if saldo_proporcionado is None:
                data['caja_saldo_final'] = saldo_calculado
        
        return data
    
    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Al cerrar, usar el saldo calculado si no se especifica
        if validated_data.get('caja_estado') is False and 'caja_saldo_final' not in validated_data:
            validated_data['caja_saldo_final'] = self.get_saldo_calculado(instance)
        return super().update(instance, validated_data)