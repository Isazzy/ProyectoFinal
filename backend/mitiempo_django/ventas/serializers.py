from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from django.utils import timezone # <--- NUEVO
from datetime import timedelta

# --- MODELOS ---
from .models import Venta, Detalle_Venta, Estado_Venta, Detalle_Venta_Servicio
from turnos.models import Turno
from servicio.models import Servicio
from inventario.models import Producto
from caja.models import Caja
from movimiento_caja.models import Ingreso, Egreso

# --- SERIALIZERS ANIDADOS ---
from cliente.serializers import ClienteSerializer
from empleado.serializers import EmpleadoNestedSerializer


# ---------------------------------------------------------
#   ESTADO DE VENTA
# ---------------------------------------------------------
class EstadoVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado_Venta
        fields = ['id', 'estado_venta_nombre']


# ---------------------------------------------------------
#   DETALLES (LECTURA)
# ---------------------------------------------------------
class DetalleVentaProductoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.producto_nombre', read_only=True)

    class Meta:
        model = Detalle_Venta
        fields = [
            'id', 'producto', 'producto_nombre', 
            'detalle_venta_cantidad', 'detalle_venta_precio_unitario', 
            'detalle_venta_descuento'
        ]


class DetalleVentaServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)

    class Meta:
        model = Detalle_Venta_Servicio
        fields = [
            'id', 'servicio', 'servicio_nombre', 
            'cantidad', 'precio', 'descuento'
        ]


# ---------------------------------------------------------
#   LISTA DE VENTAS (LECTURA)
# ---------------------------------------------------------
class VentaListSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True, allow_null=True)
    empleado_nombre = serializers.CharField(source='empleado.user.username', read_only=True) 
    estado_venta = EstadoVentaSerializer(read_only=True)
    
    productos = DetalleVentaProductoSerializer(many=True, source='detalle_venta_set', read_only=True)
    servicios = DetalleVentaServicioSerializer(many=True, source='detalle_venta_servicio_set', read_only=True)
    
    clase_turno = serializers.StringRelatedField(source='turno', read_only=True)

    class Meta:
        model = Venta
        fields = [
            'id', 'cliente', 'empleado_nombre', 'caja', 'turno', 'clase_turno',
            'estado_venta', 'venta_fecha_hora', 'venta_total', 
            'venta_medio_pago', 'venta_descuento', 'productos', 'servicios'
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
    
    cliente_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    turno_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Venta
        fields = [
            'cliente_id', 'turno_id', 'venta_medio_pago', 
            'venta_descuento', 'productos', 'servicios'
        ]

    def validate(self, data):
        # 1. Validar Caja Abierta
        if not Caja.objects.filter(caja_estado=True).exists():
            raise serializers.ValidationError("No hay una caja abierta. Debe abrir la caja antes de vender.")
            
        # 2. NUEVO: Validar Duplicidad de Turno
        turno_id = data.get('turno_id') # En DRF validate, accedemos directo al dato crudo si viene en input
        
        # Nota: Como turno_id es write_only y optional en fields, a veces viene en initial_data
        if not turno_id and 'turno_id' in self.initial_data:
             turno_id = self.initial_data['turno_id']

        if turno_id:
            # Buscamos si ya existe una venta activa para este turno
            # Excluimos las anuladas porque si se anuló, se debería permitir cobrar de nuevo (opcional)
            venta_existente = Venta.objects.filter(
                turno_id=turno_id
            ).exclude(estado_venta__estado_venta_nombre='Anulado').exists()
            
            if venta_existente:
                 raise serializers.ValidationError(f"El Turno #{turno_id} ya fue cobrado anteriormente.")

        return data
    def create(self, validated_data):
        productos_data = validated_data.pop('productos', [])
        servicios_data = validated_data.pop('servicios', [])
        cliente_id = validated_data.pop('cliente_id', None)
        turno_id = validated_data.pop('turno_id', None)

        request = self.context['request']
        empleado = request.user.empleado

        caja_abierta = Caja.objects.get(caja_estado=True)
        total_calculado = Decimal(0)

        try:
            with transaction.atomic():
                estado_pagado, _ = Estado_Venta.objects.get_or_create(estado_venta_nombre='Pagado')

                venta = Venta.objects.create(
                    empleado=empleado,
                    caja=caja_abierta,
                    cliente_id=cliente_id,
                    turno_id=turno_id,
                    estado_venta=estado_pagado,
                    venta_medio_pago=validated_data.get('venta_medio_pago', 'efectivo'),
                    venta_descuento=validated_data.get('venta_descuento', 0),
                    venta_total=0
                )

                # Productos
                for item in productos_data:
                    prod = Producto.objects.select_for_update().get(id=item['producto_id'])
                    if prod.stock < item['cantidad']:
                        raise serializers.ValidationError(f"Stock insuficiente para {prod.producto_nombre}. Disponible: {prod.stock}")

                    subtotal = (item['precio_unitario'] * item['cantidad']) - item.get('descuento', 0)
                    total_calculado += subtotal
                    
                    Detalle_Venta.objects.create(
                        venta=venta,
                        producto=prod,
                        detalle_venta_cantidad=item['cantidad'],
                        detalle_venta_precio_unitario=item['precio_unitario'],
                        detalle_venta_descuento=item.get('descuento', 0)
                    )
                    prod.stock -= item['cantidad']
                    prod.save()

                # Servicios
                for item in servicios_data:
                    serv = Servicio.objects.get(id_serv=item['servicio_id']) 
                    subtotal = (item['precio'] * item['cantidad']) - item.get('descuento', 0)
                    total_calculado += subtotal

                    Detalle_Venta_Servicio.objects.create(
                        venta=venta,
                        servicio=serv,
                        cantidad=item['cantidad'],
                        precio=item['precio'],
                        descuento=item.get('descuento', 0)
                    )

                total_final = total_calculado - venta.venta_descuento
                if total_final < 0: total_final = 0
                venta.venta_total = total_final
                venta.save()

                # Ingreso en Movimientos
                Ingreso.objects.create(
                    caja=caja_abierta,
                    ingreso_descripcion=f"Venta #{venta.id} - {venta.venta_medio_pago}",
                    ingreso_monto=total_final
                )
                
                # Actualizar saldo físico solo si es efectivo
                if venta.venta_medio_pago == 'efectivo':
                    # CORRECCIÓN: Usamos 'caja_saldo_final' para llevar el acumulado
                    # Si tu lógica era diferente (ej: 'saldo_actual'), debes agregar ese campo al modelo Caja.
                    # Por ahora, usaremos caja_saldo_final que sí existe.
                    caja_abierta.caja_saldo_final = (caja_abierta.caja_saldo_final or 0) + total_final
                    caja_abierta.save()

                return venta

        except Producto.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado.")
        except Servicio.DoesNotExist:
            raise serializers.ValidationError("Servicio no encontrado.")
        except Exception as e:
            raise serializers.ValidationError(str(e))


# ---------------------------------------------------------
#   ACTUALIZAR / ANULAR VENTA
# ---------------------------------------------------------
class VentaUpdateSerializer(serializers.ModelSerializer):
    estado_venta = serializers.PrimaryKeyRelatedField(queryset=Estado_Venta.objects.all())

    class Meta:
        model = Venta
        fields = ['estado_venta', 'venta_medio_pago']

    def update(self, instance, validated_data):
        nuevo_estado = validated_data.get('estado_venta')
        
        # Detectar intento de ANULACIÓN
        es_anulacion = (
            nuevo_estado.estado_venta_nombre.lower() == 'anulado' and 
            instance.estado_venta.estado_venta_nombre.lower() != 'anulado'
        )

        if es_anulacion:
            # 1. REGLA DE TIEMPO (30 min)
            ahora = timezone.now()
            tiempo_transcurrido = ahora - instance.venta_fecha_hora
            if tiempo_transcurrido > timedelta(minutes=30):
                raise serializers.ValidationError("El tiempo límite para anular (30 min) ha expirado.")

            # 2. Validar Caja Abierta
            caja = instance.caja
            if not caja or not caja.caja_estado:
                raise serializers.ValidationError("No se puede modificar esta venta: La caja ya fue cerrada.")

            # --- ANÁLISIS DE CONTENIDO ---
            tiene_servicios = instance.detalle_venta_servicio_set.exists()
            tiene_productos = instance.detalle_venta_set.exists()

            # CASO A: SOLO SERVICIOS -> BLOQUEAR TOTALMENTE
            if tiene_servicios and not tiene_productos:
                raise serializers.ValidationError("Esta venta es solo de Servicios. No se puede anular ni devolver dinero.")

            with transaction.atomic():
                monto_a_devolver = Decimal(0)
                descripcion_egreso = ""
                
                # CASO B: MIXTA (SERVICIOS + PRODUCTOS) -> DEVOLUCIÓN PARCIAL
                if tiene_servicios and tiene_productos:
                    # Calculamos solo el total de los productos para devolver
                    # (Cantidad * Precio Unitario) - Descuento
                    total_productos = sum(
                        (d.detalle_venta_cantidad * d.detalle_venta_precio_unitario) - d.detalle_venta_descuento 
                        for d in instance.detalle_venta_set.all()
                    )
                    
                    # Si hubo un descuento global en la venta, prorratearlo es complejo.
                    # Por seguridad, devolvemos el total directo de los productos.
                    monto_a_devolver = total_productos
                    descripcion_egreso = f"Devolución Productos (Venta Mixta #{instance.id})"
                    
                    # CAMBIAR ESTADO A "DEVOLUCIÓN PARCIAL" EN LUGAR DE "ANULADO"
                    # Buscamos o creamos el estado para no romper la integridad
                    estado_parcial, _ = Estado_Venta.objects.get_or_create(estado_venta_nombre='Devolución Parcial')
                    instance.estado_venta = estado_parcial
                    
                    # IMPORTANTE: No usamos 'nuevo_estado' (Anulado) porque el servicio sigue válido.

                # CASO C: SOLO PRODUCTOS -> ANULACIÓN TOTAL
                else:
                    monto_a_devolver = instance.venta_total
                    descripcion_egreso = f"Anulación Venta #{instance.id}"
                    instance.estado_venta = nuevo_estado # Aquí sí pasa a "Anulado"

                # --- EJECUCIÓN MONETARIA ---
                
                # 1. Registrar Egreso en Caja (Solo lo que corresponde)
                if monto_a_devolver > 0:
                    Egreso.objects.create(
                        caja=caja,
                        egreso_descripcion=descripcion_egreso,
                        egreso_monto=monto_a_devolver
                    )
                    
                    # 2. Restar saldo físico si fue efectivo
                    if instance.venta_medio_pago == 'efectivo':
                        caja.caja_saldo_final = (caja.caja_saldo_final or 0) - monto_a_devolver
                        caja.save()

            instance.save()
            return instance

        # Si no es anulación, comportamiento normal
        instance.estado_venta = nuevo_estado
        instance.save()
        return instance