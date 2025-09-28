# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Cajas(models.Model):
    id_caja = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    fech_hrs_ape = models.DateTimeField()
    fech_hrs_cie = models.DateTimeField(blank=True, null=True)
    monto_ini = models.DecimalField(max_digits=10, decimal_places=2)
    total_ingreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_egreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_caja = models.DecimalField(max_digits=10, decimal_places=2)
    estado_caja = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'cajas'


class Clientes(models.Model):
    id_cli = models.AutoField(primary_key=True)
    nombre_cli = models.CharField(max_length=50)
    apellido_cli = models.CharField(max_length=50)
    correo_cli = models.CharField(max_length=255)
    telefono_cli = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'clientes'


class Compras(models.Model):
    id_compra = models.AutoField(primary_key=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    nro_comp = models.IntegerField()
    fecha_hs_comp = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=9)

    class Meta:
        managed = False
        db_table = 'compras'


class DetCompras(models.Model):
    id_det_comp = models.AutoField(primary_key=True)
    id_comp = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_comp')
    cantidad = models.IntegerField()
    precio_uni = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'det_compras'


class DetVentas(models.Model):
    id_det_venta = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey('Ventas', models.DO_NOTHING, db_column='id_venta')
    id_prod = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_prod', blank=True, null=True)
    id_serv = models.ForeignKey('Servicios', models.DO_NOTHING, db_column='id_serv', blank=True, null=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_venta = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'det_ventas'


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


class ProductosXProveedores(models.Model):
    id_prod_x_prov = models.AutoField(primary_key=True)
    id_prod = models.ForeignKey(Productos, models.DO_NOTHING, db_column='id_prod')
    id_prov = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_prov')
    id_compra = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_compra')

    class Meta:
        managed = False
        db_table = 'productos_x_proveedores'


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


class Servicios(models.Model):
    id_serv = models.AutoField(primary_key=True)
    tipo_serv = models.CharField(max_length=100)
    nombre_serv = models.CharField(max_length=100)
    precio_serv = models.DecimalField(max_digits=9, decimal_places=0)
    duracion_serv = models.TimeField(blank=True, null=True)
    disponible_serv = models.IntegerField(blank=True, null=True)
    descripcion_serv = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'servicios'


class Turnos(models.Model):
    id_turno = models.AutoField(primary_key=True)
    id_cli = models.ForeignKey(Clientes, models.DO_NOTHING, db_column='id_cli')
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    estado_turno = models.CharField(max_length=9, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turnos'


class TurnosXServicios(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    id_turno = models.ForeignKey(Turnos, models.DO_NOTHING, db_column='id_turno')
    id_serv = models.ForeignKey(Servicios, models.DO_NOTHING, db_column='id_serv')

    class Meta:
        managed = False
        db_table = 'turnos_x_servicios'


class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre_usuario = models.CharField(max_length=100)
    apellido_usuario = models.CharField(max_length=100)
    usuario = models.CharField(max_length=100)
    contrasena = models.CharField(max_length=255)
    rol_usuario = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'usuarios'


class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    cliente = models.ForeignKey(Clientes, models.DO_NOTHING)
    fech_hs_vent = models.DateTimeField()
    tipo_venta = models.CharField(max_length=100)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'ventas'
