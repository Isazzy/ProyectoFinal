# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class Cajas(models.Model):
    id_caja = models.AutoField(primary_key=True)
    fech_hrs_ape = models.DateTimeField()
    fech_hrs_cie = models.DateTimeField(blank=True, null=True)
    monto_ini = models.DecimalField(max_digits=10, decimal_places=2)
    total_ingreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_egreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_caja = models.DecimalField(max_digits=10, decimal_places=2)
    estado_caja = models.IntegerField()
    id_usuario = models.ForeignKey('MitiempoEnloderomiCustomuser', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)

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
    nro_comp = models.IntegerField()
    fecha_hs_comp = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=9)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')

    class Meta:
        managed = False
        db_table = 'compras'


class DetCompras(models.Model):
    id_det_comp = models.AutoField(primary_key=True)
    cantidad = models.IntegerField()
    precio_uni = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    id_comp = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_comp')

    class Meta:
        managed = False
        db_table = 'det_compras'


class DetVentas(models.Model):
    id_det_venta = models.AutoField(primary_key=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_venta = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    id_prod = models.ForeignKey('Productos', models.DO_NOTHING, db_column='id_prod', blank=True, null=True)
    id_venta = models.ForeignKey('Ventas', models.DO_NOTHING, db_column='id_venta')

    class Meta:
        managed = False
        db_table = 'det_ventas'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('MitiempoEnloderomiCustomuser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class MitiempoEnloderomiCustomuser(models.Model):
    id = models.BigAutoField(primary_key=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()
    email = models.CharField(unique=True, max_length=254)
    role = models.CharField(max_length=10)
    rol_profesional = models.CharField(max_length=20, blank=True, null=True)
    dias_laborables = models.JSONField()

    class Meta:
        managed = False
        db_table = 'mitiempo_enloderomi_customuser'


class MitiempoEnloderomiCustomuserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    customuser = models.ForeignKey(MitiempoEnloderomiCustomuser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mitiempo_enloderomi_customuser_groups'
        unique_together = (('customuser', 'group'),)


class MitiempoEnloderomiCustomuserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    customuser = models.ForeignKey(MitiempoEnloderomiCustomuser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mitiempo_enloderomi_customuser_user_permissions'
        unique_together = (('customuser', 'permission'),)


class MitiempoEnloderomiProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    avatar = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    user = models.OneToOneField(MitiempoEnloderomiCustomuser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'mitiempo_enloderomi_profile'


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
    id_compra = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_compra')
    id_prod = models.ForeignKey(Productos, models.DO_NOTHING, db_column='id_prod')
    id_prov = models.ForeignKey('Proveedores', models.DO_NOTHING, db_column='id_prov')

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
    precio_serv = models.DecimalField(max_digits=9, decimal_places=2)
    duracion_serv = models.BigIntegerField(blank=True, null=True)
    disponible_serv = models.IntegerField(blank=True, null=True)
    descripcion_serv = models.TextField(blank=True, null=True)
    activado = models.IntegerField()
    rol_requerido = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'servicios'


class Turnos(models.Model):
    id_turno = models.AutoField(primary_key=True)
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    estado_turno = models.CharField(max_length=9, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    id_cli = models.ForeignKey(MitiempoEnloderomiCustomuser, models.DO_NOTHING, db_column='id_cli')
    id_prof = models.ForeignKey(MitiempoEnloderomiCustomuser, models.DO_NOTHING, db_column='id_prof', related_name='turnos_id_prof_set')

    class Meta:
        managed = False
        db_table = 'turnos'


class TurnosServicioprofesional(models.Model):
    id = models.BigAutoField(primary_key=True)
    rol = models.CharField(max_length=20, blank=True, null=True)
    profesional = models.ForeignKey(MitiempoEnloderomiCustomuser, models.DO_NOTHING)
    servicio = models.ForeignKey(Servicios, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'turnos_servicioprofesional'
        unique_together = (('servicio', 'profesional'),)


class TurnosXServicios(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    id_serv = models.ForeignKey(Servicios, models.DO_NOTHING, db_column='id_serv')
    id_turno = models.ForeignKey(Turnos, models.DO_NOTHING, db_column='id_turno')

    class Meta:
        managed = False
        db_table = 'turnos_x_servicios'


class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    fech_hs_vent = models.DateTimeField()
    tipo_venta = models.CharField(max_length=100)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=100)
    cliente = models.ForeignKey(Clientes, models.DO_NOTHING)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')

    class Meta:
        managed = False
        db_table = 'ventas'
