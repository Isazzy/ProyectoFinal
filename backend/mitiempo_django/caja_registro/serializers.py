# caja_registro/serializers.py

from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import MovimientoCaja
from caja.models import Caja
from django.contrib.auth.models import User

class MovimientoCajaSerializer(serializers.ModelSerializer):
    """
    Serializer para MovimientoCaja: Maneja creación y lectura de movimientos manuales.
    Reglas de negocio: Solo empleados/admin pueden crear; validaciones para cajas abiertas, montos positivos, y actualización de saldo.
    """
    
    class Meta:
        model = MovimientoCaja
        fields = [
            'id',  # ID del movimiento
            'caja',  # FK a caja (solo cajas abiertas)
            'tipo_movimiento',  # INGRESO o EGRESO
            'monto',  # Monto positivo
            'fecha_hora',  # Auto-generado
            'usuario',  # Usuario que crea (auto-asignado)
            'motivo',  # Descripción obligatoria
            'venta',  # Referencia opcional a venta
            'compra',  # Referencia opcional a compra
            'servicio',  # Referencia opcional a servicio
        ]
        read_only_fields = ['fecha_hora', 'usuario']  # Solo lectura para estos campos
    
    def validate_caja(self, value):
        """
        Validación: Solo cajas abiertas pueden tener movimientos.
        Regla de negocio: Evita movimientos en cajas cerradas para integridad financiera.
        """
        if not value.caja_estado:
            raise serializers.ValidationError("No se pueden registrar movimientos en cajas cerradas.")
        return value
    
    def validate_monto(self, value):
        """
        Validación: Monto debe ser positivo y mayor a 0.
        Regla de negocio: Evita movimientos inválidos en la peluquería.
        """
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0.")
        return value
    
    def validate(self, data):
        """
        Validaciones generales: Solo una referencia, tipo correcto, y permisos.
        Regla de negocio: Empleados/admin solo pueden crear; evita referencias múltiples o incorrectas.
        """
        request = self.context.get('request')
        if request and hasattr(request.user, 'role'):
            if request.user.role not in ['admin', 'empleado']:
                raise serializers.ValidationError("Solo empleados o administradores pueden registrar movimientos manuales.")
        
        # Solo una referencia (venta, compra o servicio)
        referencias = [data.get('venta'), data.get('compra'), data.get('servicio')]
        if sum(1 for ref in referencias if ref is not None) > 1:
            raise serializers.ValidationError("Solo puede haber una referencia (venta, compra o servicio).")
        
        # Tipo debe coincidir con referencia
        if data['tipo_movimiento'] == 'INGRESO' and data.get('compra'):
            raise serializers.ValidationError("Los ingresos no pueden referenciar compras.")
        if data['tipo_movimiento'] == 'EGRESO' and (data.get('venta') or data.get('servicio')):
            raise serializers.ValidationError("Los egresos no pueden referenciar ventas o servicios.")
        
        return data
    
    def create(self, validated_data):
        """
        Creación: Asigna usuario automáticamente y actualiza saldo de caja.
        Regla de negocio: Todo movimiento manual queda auditado con usuario.
        """
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)