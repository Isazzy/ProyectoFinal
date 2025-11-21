#mitiempo_django/compras/models.py
from django.db import models
from caja.models import Caja
from empleado.models import Empleado
from inventario.models import Insumo
# Create your models here.
class Proveedor(models.Model):
    proveedor_dni= models.CharField(max_length=100,unique=True,null=True, blank=True)
    proveedor_nombre = models.CharField(max_length=100)
    proveedor_direccion = models.CharField(max_length=200,null=True, blank=True)
    proveedor_telefono = models.CharField(max_length=20,null=True, blank=True)
    proveedor_email = models.EmailField(null=True, blank=True )
    
    class Meta:
        verbose_name_plural = "Proveedores"
        verbose_name = "Proveedor"
    
    def __str__(self):
        return self.proveedor_nombre


class Compra(models.Model):
    proveedor=models.ForeignKey(Proveedor,on_delete=models.CASCADE)
    empleado=models.ForeignKey(Empleado,on_delete=models.CASCADE)
    caja=models.ForeignKey(Caja,on_delete=models.CASCADE)
    compra_fecha_hora=models.DateTimeField(auto_now_add=True)
    compra_total=models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago=(
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia Bancaria')
    )
    compra_metodo_pago=models.CharField(max_length=100, choices=metodo_pago,default='efectivo')
    class Meta:
        verbose_name="Compra"
        verbose_name_plural="Compras"

    def __str__(self):
        return f"Compra N°{self.id}"
    
class Detalle_Compra(models.Model):
    compra=models.ForeignKey(Compra, on_delete=models.CASCADE)
    insumo=models.ForeignKey(Insumo,on_delete=models.CASCADE)
    detalle_compra_cantidad=models.DecimalField(max_digits=10, decimal_places=2)
    detalle_compra_precio_unitario=models.DecimalField(max_digits=10, decimal_places=2)


    class Meta:
        verbose_name="Detalle de Compra"
        verbose_name_plural="Detalles de Compras"

    def __str__(self):
        return f"Detalle de Compra N°{self.compra}"

    
