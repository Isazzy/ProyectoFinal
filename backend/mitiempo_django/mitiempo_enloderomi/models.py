from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.auth import get_user_model


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('empleado', 'Empleado'),
        ('cliente', 'Cliente'),
    ]

    PROFESION_CHOICES = [
        ('peluquera', 'Peluquera'),
        ('manicurista', 'Manicurista'),
        ('estilista', 'Estilista'),
        ('multi', 'Múltiple'),
        (None, 'Sin asignar'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='cliente')
    rol_profesional = models.CharField(max_length=20, choices=PROFESION_CHOICES, blank=True, null=True)
    dias_laborables = models.JSONField(default=list, blank=True)  # Ejemplo: ["Lunes", "Martes"]

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        if self.role == 'empleado':
            return f"{self.username} ({self.rol_profesional})"
        return f"{self.username} ({self.role})"
    
    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_staff = True
        super().save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.email}"





class Clientes(models.Model):
    id_cli = models.AutoField(primary_key=True)
    nombre_cli = models.CharField(max_length=50)
    apellido_cli = models.CharField(max_length=50)
    correo_cli = models.EmailField(max_length=255)
    telefono_cli = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'clientes'

    def __str__(self):
        return f"{self.nombre_cli} {self.apellido_cli}"


class Proveedores(models.Model):
    id_prov = models.AutoField(primary_key=True)
    nombre_prov = models.CharField(max_length=100)
    tipo_prov = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.CharField(max_length=150, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = True
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
        managed = True
        db_table = 'productos'

    def __str__(self):
        return self.nombre_prod


class Cajas(models.Model):
    id_caja = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # <- clave
        models.DO_NOTHING,
        db_column='id_usuario',
        null=True,
        blank=True
    )
    fech_hrs_ape = models.DateTimeField()
    fech_hrs_cie = models.DateTimeField(blank=True, null=True)
    monto_ini = models.DecimalField(max_digits=10, decimal_places=2)
    total_ingreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_egreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_caja = models.DecimalField(max_digits=10, decimal_places=2)
    estado_caja = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'cajas'

    def __str__(self):
        return f"Caja #{self.id_caja}"


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
    id_prod = models.ForeignKey(Productos, models.DO_NOTHING, db_column='id_prod')
    id_prov = models.ForeignKey(Proveedores, models.DO_NOTHING, db_column='id_prov')
    id_compra = models.ForeignKey(Compras, models.DO_NOTHING, db_column='id_compra')

    class Meta:
        managed = True
        db_table = 'productos_x_proveedores'




# =====================================================
#  VENTAS
# =====================================================

class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    id_caja = models.ForeignKey(Cajas, models.DO_NOTHING, db_column='id_caja')
    cliente = models.ForeignKey(Clientes, models.DO_NOTHING)
    fech_hs_vent = models.DateTimeField()
    tipo_venta = models.CharField(max_length=100)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'ventas'


class DetVentas(models.Model):
    id_det_venta = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey(Ventas, models.DO_NOTHING, db_column='id_venta')
    id_prod = models.ForeignKey(Productos, models.DO_NOTHING, db_column='id_prod', blank=True, null=True)
    #id_serv = models.ForeignKey(Servicios, models.DO_NOTHING, db_column='id_serv', blank=True, null=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_venta = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = True
        db_table = 'det_ventas'
