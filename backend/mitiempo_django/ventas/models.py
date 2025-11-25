from django.db import models
from django.core.exceptions import ValidationError
from cliente.models import Cliente
from empleado.models import Empleado
from caja.models import Caja
from turnos.models import Turno
from servicio.models import Servicio
from inventario.models import Producto

class Estado_Venta(models.Model):
    estado_venta_nombre = models.CharField(max_length=200)

    class Meta:
        verbose_name = "Estado de Venta"
        verbose_name_plural = "Estados de Ventas"

    def __str__(self):
        return self.estado_venta_nombre


class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    caja = models.ForeignKey(Caja, on_delete=models.SET_NULL, null=True, blank=True)
    turno = models.ForeignKey(Turno, on_delete=models.SET_NULL, null=True, blank=True)
    estado_venta = models.ForeignKey(Estado_Venta, on_delete=models.CASCADE)
    
    venta_fecha_hora = models.DateTimeField(auto_now_add=True)
    venta_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    MEDIO_PAGO_CHOICES = (
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
    )
    venta_medio_pago = models.CharField(max_length=20, choices=MEDIO_PAGO_CHOICES, default='efectivo')
    venta_descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ['-venta_fecha_hora']

    def __str__(self):
        return f"Venta #{self.id} - {self.venta_fecha_hora.strftime('%d/%m/%Y')}"


class Detalle_Venta(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    
    detalle_venta_cantidad = models.IntegerField()
    detalle_venta_precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    detalle_venta_descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Detalle de Venta (Producto)"
        verbose_name_plural = "Detalles de Ventas (Productos)"

    def __str__(self):
        return f"{self.producto.producto_nombre} (x{self.detalle_venta_cantidad})"
    
    def clean(self):
        if self.detalle_venta_cantidad <= 0:
            raise ValidationError("La cantidad debe ser mayor a 0.")


class Detalle_Venta_Servicio(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    
    cantidad = models.IntegerField(default=1)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = "Detalle de Venta (Servicio)"
        verbose_name_plural = "Detalles de Venta (Servicios)"

    def __str__(self):
        return f"Servicio: {self.servicio.nombre} en Venta #{self.venta.id}"