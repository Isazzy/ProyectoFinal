from django.db import models
from django.conf import settings

class Servicios(models.Model):
    id_serv = models.AutoField(primary_key=True)
    tipo_serv = models.CharField(max_length=100)
    nombre_serv = models.CharField(max_length=100)
    precio_serv = models.DecimalField(max_digits=9, decimal_places=2)
    duracion_serv = models.DurationField(blank=True, null=True)
    disponible_serv = models.IntegerField(blank=True, null=True)
    descripcion_serv = models.TextField(blank=True, null=True)
    activado = models.BooleanField(default=True)

    ROL_REQUERIDO_CHOICES = [
        ('peluquera', 'Peluquera'),
        ('manicurista', 'Manicurista'),
        ('estilista', 'Estilista'),
        ('multi', 'Múltiple'),
    ]
    rol_requerido = models.CharField(max_length=20, choices=ROL_REQUERIDO_CHOICES, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'servicios'

    def __str__(self):
        estado = "Activo" if self.activado else "Inactivo"
        return f"{self.nombre_serv} ({estado})"


class Turnos(models.Model):
    id_turno = models.AutoField(primary_key=True)
    id_cli = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='id_cli',
        limit_choices_to={'role': 'cliente'}
    )
    id_prof = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='id_prof',
        limit_choices_to={'role': 'empleado'},
        related_name='turnos_profesional'
    )
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    estado_turno = models.CharField(max_length=9, blank=True, null=True, default="pendiente")
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'turnos'

    def __str__(self):
        return f"Turno de {self.id_cli.username} con {self.id_prof.username} el {self.fecha_turno} a las {self.hora_turno}"


class TurnosXServicios(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    id_turno = models.ForeignKey(Turnos, models.DO_NOTHING, db_column='id_turno')
    id_serv = models.ForeignKey(Servicios, models.DO_NOTHING, db_column='id_serv')

    class Meta:
        managed = True
        db_table = 'turnos_x_servicios'

