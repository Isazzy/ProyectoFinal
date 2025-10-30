from django.conf import settings  
from django.core.exceptions import ValidationError
from django.db import models
from servicio.models import Servicio

class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    id_caja = models.ForeignKey('cajas.Cajas', models.DO_NOTHING, db_column='id_caja')
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        on_delete=models.DO_NOTHING,
        limit_choices_to={'role': 'cliente'}  
    )
    fech_hs_vent = models.DateTimeField()
    tipo_venta = models.CharField(max_length=100)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'ventas'

    def __str__(self):
        return f"Venta #{self.id_venta} - Cliente: {self.cliente.email}"



class DetVentas(models.Model):
    id_det_venta = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey('ventas.Ventas', models.DO_NOTHING, db_column='id_venta')

    id_prod = models.ForeignKey(
        'productos.Productos',
        models.DO_NOTHING, 
        db_column='id_prod', 
        blank=True, null=True
    )
   
    id_serv = models.ForeignKey(
        'servicio.Servicio', 
        models.DO_NOTHING, 
        db_column='id_serv', 
        blank=True, null=True
    )

    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_venta = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=True)

    def clean(self):
        # Validar que al menos id_prod o id_serv esté presente
        if not self.id_prod and not self.id_serv:
            raise ValidationError("Debe tener al menos un producto o un servicio.")

    def save(self, *args, **kwargs):
        self.clean()
        # Subtotal según lo que tenga la fila
        if self.id_prod:
            self.subtotal = self.precio_unitario * self.cantidad_venta
        elif self.id_serv:
            self.subtotal = self.precio_unitario * self.cantidad_venta
        super().save(*args, **kwargs)