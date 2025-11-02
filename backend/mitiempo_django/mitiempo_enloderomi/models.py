from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.auth import get_user_model
from productos.models import Productos

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
