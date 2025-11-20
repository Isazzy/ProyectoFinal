# turnos/models.py
from django.db import models
from django.conf import settings
from servicio.models import Servicio # Importamos desde la app 'servicios'

class Turno(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    id_turno = models.AutoField(primary_key=True)
    
    # --- LA CLAVE DEL CAMBIO ---
    fecha_hora_inicio = models.DateTimeField() 
    fecha_hora_fin = models.DateTimeField(
        help_text="Calculado automáticamente al crear/actualizar."
    ) 
    # --- FIN DEL CAMBIO ---

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='id_cli', # Mantenemos tu columna
        limit_choices_to={'role': 'cliente'},
        related_name='turnos_como_cliente'
    )
    
    profesional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='id_prof', # Mantenemos tu columna
        limit_choices_to={'role__in': ['empleado', 'admin']},
        related_name='turnos_como_profesional'
    )
    
    estado_turno = models.CharField(
        max_length=10, 
        choices=ESTADO_CHOICES, 
        default='pendiente'
    )
    observaciones = models.TextField(blank=True, null=True)
    
    servicios_incluidos = models.ManyToManyField(
        Servicio, 
        through='TurnoServicio', # Modelo 'through'
        related_name='turnos_asociados'
    )

    class Meta:
        managed = True
        db_table = 'turnos' # Mantenemos tu tabla
        verbose_name = "Turno"
        verbose_name_plural = "Turnos"
        ordering = ['fecha_hora_inicio'] 

    def __str__(self):
        return f"Turno de {self.cliente.username} con {self.profesional.username} el {self.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M')}"

# Modelo 'through' (antes TurnosXServicios)
class TurnoServicio(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    
    turno = models.ForeignKey(Turno, models.CASCADE, db_column='id_turno')
    servicio = models.ForeignKey(Servicio, models.CASCADE, db_column='id_serv')

    class Meta:
        managed = True
        db_table = 'turnos_x_servicios' # Mantenemos tu tabla
        verbose_name = "Servicio del Turno"
        verbose_name_plural = "Servicios del Turno"
        unique_together = ('turno', 'servicio')