from django.db import models
from productos.models import Productos
from proveedores.models import Proveedores
from cajas.models import Cajas

# Create your models here.
class Compras(models.Model):
    id_compra = models.AutoField(primary_key=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    nro_comp = models.IntegerField()
    fecha_hs_comp = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=9)

    class Meta:
        managed = True
        db_table = 'compras'


class DetCompras(models.Model):
    id_det_comp = models.AutoField(primary_key=True)
    id_comp = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_comp')
    cantidad = models.IntegerField()
    precio_uni = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = True
        db_table = 'det_compras'


class ProductosXProveedores(models.Model):
    id_prod_x_prov = models.AutoField(primary_key=True)
  
    id_prod = models.ForeignKey(
         'productos.Productos',
         on_delete=models.CASCADE
     )
  
    id_prov = models.ForeignKey(Proveedores, models.DO_NOTHING, db_column='id_prov')
    id_compra = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_compra')

    class Meta:
        managed = True
        db_table = 'productos_x_proveedores'