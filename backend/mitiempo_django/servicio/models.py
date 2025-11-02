# servicios/models.py
from django.db import models
from datetime import timedelta

# Modelo de Servicios
class Servicio(models.Model):
    
    id_serv = models.AutoField(primary_key=True)
    tipo_serv = models.CharField(max_length=100, help_text="Categoría del servicio, ej: 'Peluquería', 'Manicura'")
    nombre_serv = models.CharField(max_length=100)
    precio_serv = models.DecimalField(max_digits=9, decimal_places=2)
    
    # Mantenemos 'duracion_minutos' (PositiveIntegerField)
    # Es mucho más simple de sumar que un DurationField
    # y coincide con la lógica que usamos en 'TurnoServicio'.
    duracion_minutos = models.PositiveIntegerField(
        default=30,
        help_text="Duración estimada del servicio en minutos"
    ) 

    # Este es el filtro clave para el servicio
    dias_disponibles = models.JSONField(
        default=list,
        help_text="Ej: ['lunes', 'martes', 'miercoles'] (usar minúsculas)"
    )
    
    descripcion_serv = models.TextField(blank=True, null=True)
    activado = models.BooleanField(default=True)
    
    # El campo 'rol_requerido' se elimina, ya que no asignamos
    # profesionales durante la reserva.

    class Meta:
        managed = True # O False si es una tabla existente
        db_table = 'servicios' 
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"

    def __str__(self):
        estado = "Activo" if self.activado else "Inactivo"
        return f"{self.nombre_serv} ({self.duracion_minutos} min) - {estado}"

    def save(self, *args, **kwargs):
        # Asegura que los días se guarden en minúsculas y sin tildes
        self.dias_disponibles = [dia.lower().strip() for dia in self.dias_disponibles]
        super().save(*args, **kwargs)

# 
# EL MODELO 'ServicioProfesional' SE ELIMINA COMPLETAMENTE DE ESTE ARCHIVO
#