<<<<<<< HEAD
<<<<<<< HEAD
# turnos/models.py
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
from django.db import models
from django.conf import settings
from django.db.models import Sum
from datetime import timedelta
from servicio.models import Servicio 

# Modelo 1: Configuración General (sin cambios)
class ConfiguracionLocal(models.Model):
    hora_apertura = models.TimeField(default="09:00")
    hora_cierre = models.TimeField(default="18:00")
    dias_abiertos = models.JSONField(
        default=list,
        blank=True,
        help_text="Ej: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] (usar minúsculas)"
    )
    tiempo_intervalo = models.PositiveIntegerField(
        default=30,
        help_text="Intervalo base entre slots de turnos (en minutos)"
    )

    class Meta:
        verbose_name = "Configuración del local"
        verbose_name_plural = "Configuración del local"

    def __str__(self):
        return "Configuración general del local"

    def save(self, *args, **kwargs):
        self.dias_abiertos = [dia.lower().strip() for dia in self.dias_abiertos]
        super().save(*args, **kwargs)


# Modelo 2: Turno (sin cambios)
class Turno(models.Model):
<<<<<<< HEAD
=======
from django.db import models
from django.conf import settings
from django.db.models import Sum
from datetime import timedelta
from servicio.models import Servicio 

# Modelo 1: Configuración General (sin cambios)
class ConfiguracionLocal(models.Model):
    hora_apertura = models.TimeField(default="09:00")
    hora_cierre = models.TimeField(default="18:00")
    dias_abiertos = models.JSONField(
        default=list,
        blank=True,
        help_text="Ej: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] (usar minúsculas)"
    )
    tiempo_intervalo = models.PositiveIntegerField(
        default=30,
        help_text="Intervalo base entre slots de turnos (en minutos)"
    )

    class Meta:
        verbose_name = "Configuración del local"
        verbose_name_plural = "Configuración del local"

    def __str__(self):
        return "Configuración general del local"

    def save(self, *args, **kwargs):
        self.dias_abiertos = [dia.lower().strip() for dia in self.dias_abiertos]
        super().save(*args, **kwargs)


# Modelo 2: Turno (sin cambios)
class Turno(models.Model):
    id_turno = models.AutoField(primary_key=True)
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    id_turno = models.AutoField(primary_key=True)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

<<<<<<< HEAD
<<<<<<< HEAD
    id_turno = models.AutoField(primary_key=True)
    
    # --- LA CLAVE DEL CAMBIO ---
    fecha_hora_inicio = models.DateTimeField() 
    fecha_hora_fin = models.DateTimeField(
        help_text="Calculado automáticamente al crear/actualizar."
    ) 
    # --- FIN DEL CAMBIO ---

=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='turnos_como_cliente',
        db_column='id_cli',
        limit_choices_to={'role': 'cliente'}
    )
    
    fecha_hora_inicio = models.DateTimeField()

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES, 
        default='pendiente'
    )
    
    observaciones = models.TextField(blank=True, null=True)

    servicios = models.ManyToManyField(
        Servicio,
        through='TurnoServicio',
        related_name='turnos'
    )

<<<<<<< HEAD
    class Meta:
        managed = True
        db_table = 'turnos' # Mantenemos tu tabla
=======
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='turnos_como_cliente',
        db_column='id_cli',
        limit_choices_to={'role': 'cliente'}
    )
    
    fecha_hora_inicio = models.DateTimeField()

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES, 
        default='pendiente'
    )
    
    observaciones = models.TextField(blank=True, null=True)

    servicios = models.ManyToManyField(
        Servicio,
        through='TurnoServicio',
        related_name='turnos'
    )

    class Meta: 
        db_table = 'turnos'
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    class Meta: 
        db_table = 'turnos'
>>>>>>> 5f5a7856 (Actualizacion de models.py)
        verbose_name = "Turno"
        verbose_name_plural = "Turnos"
        ordering = ['fecha_hora_inicio'] 

    def __str__(self):
<<<<<<< HEAD
<<<<<<< HEAD
        return f"Turno de {self.cliente.username} con {self.profesional.username} el {self.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M')}"
=======
        fecha_hora_str = self.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M')
        return f"Turno {fecha_hora_str} - {self.cliente}"
>>>>>>> 5f5a7856 (Actualizacion de models.py)

    @property
    def duracion_total_minutos(self) -> int:
        """
        Calcula la duración total del turno sumando 'duracion_servicio'
        de todas las entradas de TurnoServicio asociadas.
        """
        if not self.pk:
            return 0
        
        # Llama a la 'related_name' que definimos en TurnoServicio
        agregado = self.servicios_asignados.aggregate(
            total=Sum('duracion_servicio')
        )
        return agregado['total'] or 0

    @property
    def fecha_hora_fin(self):
        """
        Calcula la hora de finalización del turno.
        """
        if not self.fecha_hora_inicio:
            return None
        return self.fecha_hora_inicio + timedelta(minutes=self.duracion_total_minutos)


# Modelo 3: Tabla Intermedia (Método save ACTUALIZADO)
class TurnoServicio(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    
    turno = models.ForeignKey(
        Turno, 
        on_delete=models.CASCADE, 
        db_column='id_turno',
        related_name='servicios_asignados' 
    )
    servicio = models.ForeignKey(
        Servicio, 
        on_delete=models.CASCADE, 
        db_column='id_serv'
    )
    
    duracion_servicio = models.PositiveIntegerField(
        help_text="Duración en minutos del servicio en este turno",
        default=30
    )
    class Meta:
<<<<<<< HEAD
        managed = True
        db_table = 'turnos_x_servicios' # Mantenemos tu tabla
        verbose_name = "Servicio del Turno"
        verbose_name_plural = "Servicios del Turno"
        unique_together = ('turno', 'servicio')
=======
        fecha_hora_str = self.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M')
        return f"Turno {fecha_hora_str} - {self.cliente}"

    @property
    def duracion_total_minutos(self) -> int:
        """
        Calcula la duración total del turno sumando 'duracion_servicio'
        de todas las entradas de TurnoServicio asociadas.
        """
        if not self.pk:
            return 0
        
        # Llama a la 'related_name' que definimos en TurnoServicio
        agregado = self.servicios_asignados.aggregate(
            total=Sum('duracion_servicio')
        )
        return agregado['total'] or 0

    @property
    def fecha_hora_fin(self):
        """
        Calcula la hora de finalización del turno.
        """
        if not self.fecha_hora_inicio:
            return None
        return self.fecha_hora_inicio + timedelta(minutes=self.duracion_total_minutos)


# Modelo 3: Tabla Intermedia (Método save ACTUALIZADO)
class TurnoServicio(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    
    turno = models.ForeignKey(
        Turno, 
        on_delete=models.CASCADE, 
        db_column='id_turno',
        related_name='servicios_asignados' 
    )
    servicio = models.ForeignKey(
        Servicio, 
        on_delete=models.CASCADE, 
        db_column='id_serv'
    )
    
    duracion_servicio = models.PositiveIntegerField(
        help_text="Duración en minutos del servicio en este turno",
        default=30
    )
    class Meta:
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
        db_table = 'turnos_x_servicios' 
        verbose_name = "Servicio asignado al turno"
        verbose_name_plural = "Servicios asignados a los turnos"
        unique_together = ('turno', 'servicio')

    def __str__(self):
        try:
            return f"{self.servicio.nombre_serv} - {self.turno}"
        except AttributeError:
            return f"Servicio ID (desconocido) - Turno ID {self.turno_id}"

    # --- MÉTODO SAVE ACTUALIZADO ---
    def save(self, *args, **kwargs):
<<<<<<< HEAD
<<<<<<< HEAD
        if (not self.duracion_servicio or self.duracion_servicio == 30) and hasattr(self, 'servicio') and self.servicio:

            if hasattr(self.servicio, 'duracion_minutos') and self.servicio.duracion_minutos > 0:
                 self.duracion_servicio = self.servicio.duracion_minutos

=======
        """
        Autocompleta la duración del servicio al guardar.
        Si la duración es 0, None, o el default (30),
        intenta obtener la duración *correcta* del modelo Servicio.
        """
        # Comprobamos 'hasattr' por si el servicio aún no está asignado
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        if (not self.duracion_servicio or self.duracion_servicio == 30) and hasattr(self, 'servicio') and self.servicio:

            if hasattr(self.servicio, 'duracion_minutos') and self.servicio.duracion_minutos > 0:
                 self.duracion_servicio = self.servicio.duracion_minutos
<<<<<<< HEAD
            
            # Fallback por si acaso el modelo Servicio usa 'duracion' (DurationField)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======

>>>>>>> 67ec8a26 (Producto terminado (Creo))
            elif hasattr(self.servicio, 'duracion') and self.servicio.duracion.total_seconds() > 0:
                 self.duracion_servicio = int(self.servicio.duracion.total_seconds() / 60)
        
        # Aseguramos que nunca sea 0 o None si la lógica anterior falla
        if not self.duracion_servicio:
            self.duracion_servicio = 30 

<<<<<<< HEAD
        super().save(*args, **kwargs)
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
        super().save(*args, **kwargs)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
