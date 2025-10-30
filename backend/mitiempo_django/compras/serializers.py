# compras/serializers.py

from rest_framework import serializers
from .models import Proveedores, Compra, DetalleCompra, productos_x_proveedores
from productos.models import Productos
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum  # ✅ usamos Sum de Django ORM

# ✅ alias para que el helper use el mismo nombre que invoca
ProductoXProveedor = productos_x_proveedores


class ProveedoresSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Proveedor"""

    # Campo calculado: total de compras
    total_compras = serializers.SerializerMethodField()

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
            'fecha_registro',
            'total_compras'
        ]
        read_only_fields = ['id_prov', 'fecha_registro']

    def get_total_compras(self, obj):
        """Calcula el total de compras realizadas a este proveedor"""
        # ✅ usar Sum del ORM; si no hay compras, devolver 0
        agg = obj.compras.filter(estado='COMPLETADA').aggregate(total=Sum('total_compra'))
        return agg['total'] or 0

    def validate_correo(self, value):
        """Validación personalizada del correo"""
        if value and '@' not in value:
            raise serializers.ValidationError("Ingrese un correo válido")
        return value.lower() if value else value


class productos_x_proveedoresSerializer(serializers.ModelSerializer):
    """Serializer para la relación Producto-Proveedor"""

    nombre_producto = serializers.CharField(source='id_prod.nombre_prod', read_only=True)
    nombre_proveedor = serializers.CharField(source='id_prov.nombre_prov', read_only=True)

    class Meta:
        model = productos_x_proveedores
        fields = [
            'id_prod_x_prov',
            'id_prod',
            'id_prov',
            'nombre_producto',
            'nombre_proveedor',
            'd_compra',
            'precio_ultima_compra'
        ]
        read_only_fields = ['id_prod_x_prov']


class DetalleCompraSerializer(serializers.ModelSerializer):
    """Serializer para DetalleCompra"""

    nombre_producto = serializers.CharField(source='producto.nombre_prod', read_only=True)

    # Campos calculados (read-only)
    subtotal_calculado = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='subtotal'
    )
    total_calculado = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
        source='total'
    )

    class Meta:
        model = DetalleCompra
        fields = [
            'id_det_comp',
            'producto',
            'nombre_producto',
            'cantidad',
            'precio_um',
            'subtotal',
            'total',
            'subtotal_calculado',
            'total_calculado'
        ]
        read_only_fields = ['id_det_comp', 'subtotal', 'total']

    def validate_cantidad(self, value):
        """Validar que la cantidad sea positiva"""
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value

    def validate_precio_um(self, value):
        """Validar que el precio sea positivo"""
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value


class CompraSerializer(serializers.ModelSerializer):
    """Serializer para Compra (sin detalles anidados)"""

    nombre_proveedor = serializers.CharField(source='proveedor.nombre_prov', read_only=True)
    nombre_usuario = serializers.CharField(source='ro_usuario.username', read_only=True)

    class Meta:
        model = Compra
        fields = [
            'id_compra',
            'id_caja',
            'fecha_hs_comp',
            'estado',
            'ro_usuario',
            'nombre_usuario',
            'proveedor',
            'nombre_proveedor',
            'total_compra',
            'metodo_pago',
            'notas'
        ]
        read_only_fields = ['id_compra', 'fecha_hs_comp', 'total_compra']


class CompraDetalleSerializer(serializers.ModelSerializer):
    """Serializer para Compra CON detalles anidados (para crear/actualizar)"""

    detalles = DetalleCompraSerializer(many=True)
    nombre_proveedor = serializers.CharField(source='proveedor.nombre_prov', read_only=True)
    nombre_usuario = serializers.CharField(source='ro_usuario.username', read_only=True)

    class Meta:
        model = Compra
        fields = [
            'id_compra',
            'id_caja',
            'fecha_hs_comp',
            'estado',
            'ro_usuario',
            'nombre_usuario',
            'proveedor',
            'nombre_proveedor',
            'total_compra',
            'metodo_pago',
            'notas',
            'detalles'
        ]
        read_only_fields = ['id_compra', 'fecha_hs_comp', 'total_compra']

    def validate_detalles(self, value):
        """Validar que haya al menos un detalle"""
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un producto en la compra")
        return value

    def validate(self, attrs):
        """Validaciones a nivel de objeto"""
        proveedor = attrs.get('proveedor')
        if proveedor and not proveedor.activo:
            raise serializers.ValidationError({
                'proveedor': 'El proveedor seleccionado no está activo'
            })
        # Nueva regla: Validar que el total no exceda un límite (e.g., 10000)
        total_estimado = sum(d.get('cantidad', 0) * d.get('precio_um', 0) for d in attrs.get('detalles', []))
        if total_estimado > 10000:
            raise serializers.ValidationError("El total de la compra no puede exceder $10,000.")
        return attrs
    
    

    @transaction.atomic
    def create(self, validated_data):
        """
        Crear Compra con sus Detalles en una transacción atómica
        """
        detalles_data = validated_data.pop('detalles')

        # Crear la compra
        compra = Compra.objects.create(**validated_data)

        # Crear los detalles
        total = Decimal('0.00')
        for detalle_data in detalles_data:
            detalle = DetalleCompra.objects.create(
                id_compra=compra,
                **detalle_data
            )
            total += detalle.total

            # Actualizar relación Producto-Proveedor
            self._actualizar_producto_proveedor(
                producto=detalle.producto,
                proveedor=compra.proveedor,
                precio=detalle.precio_um
            )

        # Actualizar total de la compra
        compra.total_compra = total
        compra.save()

        return compra

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Actualizar Compra y sus Detalles
        """
        detalles_data = validated_data.pop('detalles', None)

        # Actualizar campos de la compra
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Si se enviaron detalles, reemplazar todos
        if detalles_data is not None:
            instance.detalles.all().delete()

            total = Decimal('0.00')
            for detalle_data in detalles_data:
                detalle = DetalleCompra.objects.create(
                    id_compra=instance,
                    **detalle_data
                )
                total += detalle.total

                self._actualizar_producto_proveedor(
                    producto=detalle.producto,
                    proveedor=instance.proveedor,
                    precio=detalle.precio_um
                )

            instance.total_compra = total
            instance.save()

        return instance

    def _actualizar_producto_proveedor(self, producto, proveedor, precio):
        """
        Actualiza o crea la relación Producto-Proveedor con el último precio
        """
        from django.utils import timezone

        prod_prov, created = ProductoXProveedor.objects.get_or_create(
            id_prod=producto,
            id_prov=proveedor,
            defaults={
                'd_compra': timezone.now().date(),
                'precio_ultima_compra': precio
            }
        )

        if not created:
            prod_prov.d_compra = timezone.now().date()
            prod_prov.precio_ultima_compra = precio
            prod_prov.save()

    


class CompraListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar compras"""

    nombre_proveedor = serializers.CharField(source='proveedor.nombre_prov', read_only=True)
    nombre_usuario = serializers.CharField(source='ro_usuario.username', read_only=True)
    cantidad_productos = serializers.IntegerField(
        source='detalles.count',
        read_only=True
    )

    class Meta:
        model = Compra
        fields = [
            'id_compra',
            'fecha_hs_comp',
            'nombre_proveedor',
            'nombre_usuario',
            'total_compra',
            'estado',
            'metodo_pago',
            'cantidad_productos'
        ]
