from django.db import models

# Create your models here.
# servicios/models.py
from django.db import models
from django.conf import settings

# Modelo de Servicios
class Servicio(models.Model):
    # Definiciones de roles (las moví aquí para que sean parte del modelo)
    PELUQUERA = 'peluquera'
    MANICURISTA = 'manicurista'
    ESTILISTA = 'estilista'
    MULTI = 'multi'
    ROL_REQUERIDO_CHOICES = [
        (PELUQUERA, 'Peluquera'),
        (MANICURISTA, 'Manicurista'),
        (ESTILISTA, 'Estilista'),
        (MULTI, 'Múltiple'),
    ]

    # Campos del modelo
    id_serv = models.AutoField(primary_key=True)
    tipo_serv = models.CharField(max_length=100)
    nombre_serv = models.CharField(max_length=100)
    precio_serv = models.DecimalField(max_digits=9, decimal_places=2)
    # DurationField es perfecto para esto
    duracion_serv = models.DurationField(
        help_text="Duración estimada del servicio. Formato: HH:MM:SS"
    ) 
    descripcion_serv = models.TextField(blank=True, null=True)
    activado = models.BooleanField(default=True)
    rol_requerido = models.CharField(
        max_length=20, 
        choices=ROL_REQUERIDO_CHOICES, 
        blank=True, null=True,
        help_text="Rol genérico requerido para este servicio"
    )

    class Meta:
        managed = True
        db_table = 'servicios' # Mantenemos el nombre de tu tabla
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"

    def __str__(self):
        estado = "Activo" if self.activado else "Inactivo"
        return f"{self.nombre_serv} ({self.duracion_serv}) - {estado}"

# Modelo que vincula qué profesional puede hacer qué servicio
class ServicioProfesional(models.Model):
    # Usamos el modelo Servicio que acabamos de definir
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE) 
    
    # Usamos el AUTH_USER_MODEL (CustomUser)
    profesional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        # Limitamos esto a usuarios que sean 'empleados'
        limit_choices_to={'role': 'empleado'}, 
        related_name="servicios_que_realiza"
    )
    
    # Este campo es opcional, ya que CustomUser tiene 'rol_profesional'
    # Pero es útil si un 'multi' actúa como 'peluquera' para un servicio específico.
    rol = models.CharField(
        max_length=20,
        choices=Servicio.ROL_REQUERIDO_CHOICES,
        blank=True, null=True,
        help_text="Rol específico que cumple el profesional en ESTE servicio"
    )

    class Meta:
        # Asegura que no se pueda asignar el mismo servicio al mismo profesional dos veces
        unique_together = ('servicio', 'profesional') 
        verbose_name = "Servicio por Profesional"
        verbose_name_plural = "Servicios por Profesionales"

    def __str__(self):
        return f"{self.profesional.username} puede realizar {self.servicio.nombre_serv}"