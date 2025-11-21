from django.db import models, transaction
from django.conf import settings
from django.db.models import Sum
from datetime import timedelta
from django.core.exceptions import ValidationError
from servicio.models import Servicio


# -------------------------------------------------------------------
# MODELO 1 — CONFIGURACIÓN GENERAL DEL LOCAL
# -------------------------------------------------------------------
class ConfiguracionLocal(models.Model):
    hora_apertura = models.TimeField(default="09:00")
    hora_cierre = models.TimeField(default="18:00")

    dias_abiertos = models.JSONField(
        default=list,
        blank=True,
        help_text="Ej: ['lunes', 'martes', 'miercoles', ...] (minúsculas)"
    )

    tiempo_intervalo = models.PositiveIntegerField(
        default=30,
        help_text="Intervalo base entre turnos en minutos."
    )

    class Meta:
        verbose_name = "Configuración del local"
        verbose_name_plural = "Configuración del local"

    def __str__(self):
        return "Configuración general del local"

    def save(self, *args, **kwargs):
        self.dias_abiertos = [dia.lower().strip() for dia in self.dias_abiertos]
        super().save(*args, **kwargs)


# -------------------------------------------------------------------
# MODELO 2 — TURNOS
# -------------------------------------------------------------------
class Turno(models.Model):
    id_turno = models.AutoField(primary_key=True)

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='turnos_como_cliente',
        db_column='id_cli'
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
        verbose_name = "Turno"
        verbose_name_plural = "Turnos"
        ordering = ['fecha_hora_inicio']

    def __str__(self):
        fecha_hora_str = self.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M')
        return f"Turno {fecha_hora_str} - {self.cliente}"

    # -------------------------------------------------------------------
    # PROPIEDADES Y CÁLCULOS
    # -------------------------------------------------------------------
    @property
    def duracion_total_minutos(self):
        """
        Total de minutos sumando todos los servicios asignados.
        """
        if not self.pk:
            return 0

        datos = self.servicios_asignados.aggregate(
            total=Sum('duracion_servicio')
        )
        return datos['total'] or 0

    @property
    def fecha_hora_fin(self):
        """Devuelve cuándo termina el turno."""
        if not self.fecha_hora_inicio:
            return None
        return self.fecha_hora_inicio + timedelta(minutes=self.duracion_total_minutos)

    # -------------------------------------------------------------------
    # VALIDACIÓN DE REGLAS DE NEGOCIO
    # -------------------------------------------------------------------
    def clean(self):
        # Si el turno aún no existe, no validar relaciones M2M
        if not self.pk:
            return

        config = ConfiguracionLocal.objects.first()
        if not config:
            raise ValidationError("Falta la configuración del local. Debe existir 1 registro.")

        dia_semana = self.fecha_hora_inicio.strftime("%A").lower()

        equivalencias = {
            "monday": "lunes",
            "tuesday": "martes",
            "wednesday": "miercoles",
            "thursday": "jueves",
            "friday": "viernes",
            "saturday": "sabado",
            "sunday": "domingo"
        }
        dia_semana = equivalencias.get(dia_semana, dia_semana)

        if dia_semana not in config.dias_abiertos:
            raise ValidationError(f"El local no abre los días {dia_semana}.")

        # Validar servicios asignados SOLO si el turno ya existe
        for ts in self.servicios_asignados.all():
            serv = ts.servicio

            if not serv.activado:
                raise ValidationError(f"El servicio '{serv.nombre_serv}' está inactivo.")

            if dia_semana not in serv.dias_disponibles:
                raise ValidationError(
                    f"El servicio '{serv.nombre_serv}' no se ofrece los días {dia_semana}."
                )

    def consumir_insumos(self):
        """Descuenta del stock real según los servicios del turno."""
        with transaction.atomic():
            for ts in self.turnoservicio_set.select_related("servicio").all():
                servicio = ts.servicio

                for si in servicio.servicioinsumo_set.select_related("insumo").all():
                    insumo = si.insumo
                    cantidad = si.cantidad_usada

                    if insumo.insumo_stock < cantidad:
                        raise ValidationError(
                            f"Stock insuficiente de {insumo.insumo_nombre}. "
                            f"Se requiere {cantidad}, disponible {insumo.insumo_stock}"
                        )

                    insumo.insumo_stock -= cantidad
                    insumo.save()

    def save(self, *args, **kwargs):
        self.full_clean()  # Ejecuta validaciones previas
        super().save(*args, **kwargs)


# -------------------------------------------------------------------
# MODELO 3 — TABLA INTERMEDIA SERVICIO X TURNO
# -------------------------------------------------------------------
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

    duracion_servicio = models.PositiveIntegerField(#Esto deberia venir de Servicios
        help_text="Duración en minutos del servicio en este turno",
        default=30
    )

    class Meta:
        db_table = 'turnos_x_servicios'
        verbose_name = "Servicio asignado al turno"
        verbose_name_plural = "Servicios asignados a los turnos"
        unique_together = ('turno', 'servicio')

    def __str__(self):
        try:
            return f"{self.servicio.nombre_serv} - {self.turno}"
        except Exception:
            return f"Servicio desconocido - Turno {self.turno_id}"

    def save(self, *args, **kwargs):
        """

        - Si no pisan duración, se asigna automáticamente la duración real del servicio.
        """
        if (not self.duracion_servicio or self.duracion_servicio == 30) and self.servicio:

            if hasattr(self.servicio, 'duracion_minutos') and self.servicio.duracion_minutos > 0:
                self.duracion_servicio = self.servicio.duracion_minutos

        if not self.duracion_servicio:
            self.duracion_servicio = 30

        super().save(*args, **kwargs)
