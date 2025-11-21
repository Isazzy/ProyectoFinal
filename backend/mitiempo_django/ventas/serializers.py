from rest_framework import serializers
from .models import Venta, Detalle_Venta, Estado_Venta, Detalle_Venta_Servicio
from turnos.models import Turno, TurnoServicio
from servicio.models import Servicio
from inventario.models import Producto
from cliente.serializers import ClienteSerializer
from empleado.serializers import EmpleadoNestedSerializer
from caja.models import Caja

# ---------------------------------------------------------
#   ESTADO DE VENTA
# ---------------------------------------------------------
class EstadoVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado_Venta
        fields = ['id', 'estado_venta_nombre']


# ---------------------------------------------------------
#   DETALLES DE PRODUCTO (LECTURA)
# ---------------------------------------------------------
class DetalleVentaProductoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.producto_nombre', read_only=True)

    class Meta:
        model = Detalle_Venta
        fields = [
            'id',
            'producto',
            'producto_nombre',
            'detalle_venta_cantidad',
            'detalle_venta_precio_unitario',
            'detalle_venta_descuento',
        ]


# ---------------------------------------------------------
#   DETALLES DE SERVICIO (LECTURA)
# ---------------------------------------------------------
class DetalleVentaServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.servicio_nombre', read_only=True)

    class Meta:
        model = Detalle_Venta_Servicio
        fields = [
            'id',
            'servicio',
            'servicio_nombre',
            'cantidad',
            'precio',
            'descuento',
        ]


# ---------------------------------------------------------
#   LISTA DE VENTAS (LECTURA)
# ---------------------------------------------------------
class VentaListSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True, allow_null=True)
    empleado = EmpleadoNestedSerializer(source='empleado.user', read_only=True)
    estado_venta = EstadoVentaSerializer(read_only=True)

    productos = DetalleVentaProductoSerializer(
        many=True,
        source='detalle_venta_set',
        read_only=True
    )
    
    servicios = DetalleVentaServicioSerializer(
        many=True,
        source='detalle_venta_servicio_set',
        read_only=True
    )

    clase_turno = serializers.StringRelatedField(source='turno', read_only=True)

    class Meta:
        model = Venta
        fields = [
            'id',
            'cliente',
            'empleado',
            'caja',
            'turno',
            'estado_venta',
            'venta_fecha_hora',
            'venta_total',
            'venta_medio_pago',
            'venta_descuento',
            'productos',
            'servicios',
        ]


# ---------------------------------------------------------
#   DETALLES (ESCRITURA)
# ---------------------------------------------------------
class DetalleVentaProductoWriteSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField()
    precio_unitario = serializers.DecimalField(max_digits=10, decimal_places=2)
    descuento = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)


class DetalleVentaServicioWriteSerializer(serializers.Serializer):
    servicio_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(default=1)
    precio = serializers.DecimalField(max_digits=10, decimal_places=2)
    descuento = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)


# ---------------------------------------------------------
#   CREAR VENTA (POST)
# ---------------------------------------------------------
class VentaCreateSerializer(serializers.ModelSerializer):
    productos = DetalleVentaProductoWriteSerializer(many=True, required=False)
    servicios = DetalleVentaServicioWriteSerializer(many=True, required=False)

    class Meta:
        model = Venta
        fields = [
            'cliente',
            'turno',
            'venta_medio_pago',
            'venta_descuento',
            'productos',
            'servicios',
        ]

    def create(self, validated_data):
        productos_data = validated_data.pop('productos', [])
        servicios_data = validated_data.pop('servicios', [])

        request = self.context['request']

        if not hasattr(request.user, "empleado"):
            raise serializers.ValidationError("El usuario no está asociado a un empleado.")

        empleado = request.user.empleado

        # Caja activa
        try:
            caja_abierta = Caja.objects.get(caja_estado=True)
        except Caja.DoesNotExist:
            raise serializers.ValidationError("No hay una caja abierta para registrar la venta.")

        venta_total = 0

        # Crear venta
        venta = Venta.objects.create(
            empleado=empleado,
            caja=caja_abierta,
            estado_venta=Estado_Venta.objects.get(estado_venta_nombre='Pagado'),
            venta_total=0,
            **validated_data
        )

        # Registrar productos
        for item in productos_data:
            Detalle_Venta.objects.create(
                venta=venta,
                producto_id=item['producto_id'],
                detalle_venta_cantidad=item['cantidad'],
                detalle_venta_precio_unitario=item['precio_unitario'],
                detalle_venta_descuento=item.get('descuento', 0)
            )
            venta_total += (item['precio_unitario'] * item['cantidad']) - item.get('descuento', 0)

        # Registrar servicios
        for item in servicios_data:
            Detalle_Venta_Servicio.objects.create(
                venta=venta,
                servicio_id=item['servicio_id'],
                cantidad=item['cantidad'],
                precio=item['precio'],
                descuento=item.get('descuento', 0)
            )
            venta_total += (item['precio'] * item['cantidad']) - item.get('descuento', 0)

        # Descuento final
        venta_total -= validated_data.get('venta_descuento', 0)

        venta.venta_total = venta_total
        venta.save()

        return venta


# ---------------------------------------------------------
#   UPDATE / PATCH
# ---------------------------------------------------------
class VentaUpdateSerializer(serializers.ModelSerializer):
    estado_venta = serializers.PrimaryKeyRelatedField(queryset=Estado_Venta.objects.all())
    venta_medio_pago = serializers.ChoiceField(choices=Venta.MEDIO_PAGO_CHOICES)

    class Meta:
        model = Venta
        fields = ['estado_venta', 'venta_medio_pago']
