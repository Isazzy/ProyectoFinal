# productos/models.py
from django.db import models


# Stubs para satisfacer las FKs desde Compras/Ventas
class Cajas(models.Model):
    id_caja = models.AutoField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'cajas'

class Clientes(models.Model):
    id_cli = models.AutoField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'clientes'

class Proveedores(models.Model):
    id_prov = models.AutoField(primary_key=True)
    nombre_prov = models.CharField(max_length=100)
    tipo_prov = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.CharField(max_length=150, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'proveedores'

    def __str__(self):
        return self.nombre_prov


class Productos(models.Model):
    id_prod = models.AutoField(primary_key=True)
    nombre_prod = models.CharField(max_length=100)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2)
    stock_min_prod = models.IntegerField()
    stock_act_prod = models.IntegerField()
    reposicion_prod = models.IntegerField()
    stock_max_prod = models.IntegerField()
    tipo_prod = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'productos'
        indexes = [
            models.Index(fields=['nombre_prod']),
            models.Index(fields=['tipo_prod']),
        ]

    def __str__(self):
        return self.nombre_prod


class Compras(models.Model):
    id_compra = models.AutoField(primary_key=True)
    nro_comp = models.IntegerField()
    fecha_hs_comp = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=9)
    id_caja = models.ForeignKey('Cajas', models.PROTECT, db_column='id_caja')  # opcional si usás caja

    class Meta:
        managed = False
        db_table = 'compras'


class DetCompras(models.Model):
    id_det_comp = models.AutoField(primary_key=True)
    cantidad = models.IntegerField()
    precio_uni = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    id_comp = models.ForeignKey(Compras, models.CASCADE, db_column='id_comp', related_name='detalles')
    # Si tu esquema original no tiene FK a Productos aquí, omitilo; si existe, agregalo:
    # id_prod = models.ForeignKey(Productos, models.PROTECT, db_column='id_prod', related_name='compras_detalle')

    class Meta:
        managed = False
        db_table = 'det_compras'


class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    fech_hs_vent = models.DateTimeField()
    tipo_venta = models.CharField(max_length=100)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=100)
    cliente = models.ForeignKey('Clientes', models.PROTECT)
    id_caja = models.ForeignKey('Cajas', models.PROTECT, db_column='id_caja')

    class Meta:
        managed = False
        db_table = 'ventas'


class DetVentas(models.Model):
    id_det_venta = models.AutoField(primary_key=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_venta = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    id_prod = models.ForeignKey(Productos, models.PROTECT, db_column='id_prod', related_name='ventas_detalle', blank=True, null=True)
    id_venta = models.ForeignKey(Ventas, models.CASCADE, db_column='id_venta', related_name='detalles')

    class Meta:
        managed = False
        db_table = 'det_ventas'


class ProductosXProveedores(models.Model):
    id_prod_x_prov = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(Compras, models.PROTECT, db_column='id_compra', related_name='productos_proveedor')
    id_prod = models.ForeignKey(Productos, models.PROTECT, db_column='id_prod', related_name='proveedor_rel')
    id_prov = models.ForeignKey(Proveedores, models.PROTECT, db_column='id_prov', related_name='productos_rel')

    class Meta:
        managed = False
        db_table = 'productos_x_proveedores'
        unique_together = (('id_compra', 'id_prod', 'id_prov'),)
