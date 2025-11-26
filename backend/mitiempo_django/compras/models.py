#mitiempo_django/compras/models.py
#mitiempo_django/compras/models.py
from django.db import models
from django.utils import timezone # Necesario para save()
from django.core.exceptions import ValidationError
from caja.models import Caja
from empleado.models import Empleado
from inventario.models import Insumo , Producto

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
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT)
    empleado=models.ForeignKey(Empleado,on_delete=models.PROTECT)
    caja=models.ForeignKey(Caja,on_delete=models.CASCADE)
    
    # 🌟 CAMPOS SEPARADOS: Reemplazo de DateTimeField
    compra_fecha = models.DateField(db_index=True) # Campo de Fecha
    compra_hora = models.TimeField() # Campo de Hora
    
    compra_total=models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago=(
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia Bancaria')
    )
    compra_metodo_pago=models.CharField(max_length=100, choices=metodo_pago,default='efectivo')
    
    class Meta:
        verbose_name="Compra"
        verbose_name_plural="Compras"
        ordering = ('-compra_fecha', '-compra_hora') # Nueva ordenación

    def __str__(self):
        return f"Compra N°{self.id}"
    
    # Override de save para asignar la fecha/hora actual en la creación
    def save(self, *args, **kwargs):
        # Asigna la fecha y hora actuales si el objeto es nuevo
        if not self.pk:
            now = timezone.localtime(timezone.now())
            
            if not self.compra_fecha:
                self.compra_fecha = now.date()
            if not self.compra_hora:
                self.compra_hora = now.time()
        super().save(*args, **kwargs)
    
# ... (Detalle_Compra sigue igual) ...
    
class Detalle_Compra(models.Model):
    compra=models.ForeignKey(Compra, on_delete=models.CASCADE)
    insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE, null=True, blank=True)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, null=True, blank=True)
    detalle_compra_cantidad=models.DecimalField(max_digits=10, decimal_places=2)
    detalle_compra_precio_unitario=models.DecimalField(max_digits=10, decimal_places=2)


    class Meta:
        verbose_name="Detalle de Compra"
        verbose_name_plural="Detalles de Compras"

    def __str__(self):
        return f"Detalle de Compra N°{self.compra}"
    
    class Meta:
        verbose_name = "Detalle de Compra"
        verbose_name_plural = "Detalles de Compras"

    def __str__(self):
        item = self.insumo.insumo_nombre if self.insumo else self.producto.producto_nombre
        return f"{item} en Compra N°{self.compra.id}"

    def clean(self):
        # Regla de Negocio: Debe tener Insumo O Producto, pero no ambos, ni ninguno.
        if not self.insumo and not self.producto:
            raise ValidationError("El detalle debe estar asociado a un Insumo o a un Producto.")
        if self.insumo and self.producto:
            raise ValidationError("El detalle no puede ser de Insumo y Producto a la vez.")
            
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    
