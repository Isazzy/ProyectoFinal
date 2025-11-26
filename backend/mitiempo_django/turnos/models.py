from django.db import models
from django.conf import settings
from django.db.models import Sum
from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import transaction
from servicio.models import Servicio

class ConfiguracionLocal(models.Model):
    hora_apertura = models.TimeField(default="09:00")
    hora_cierre = models.TimeField(default="18:00")
    dias_abiertos = models.JSONField(default=list, blank=True)
    tiempo_intervalo = models.PositiveIntegerField(default=30)

    class Meta:
        verbose_name = "Configuración del local"
        verbose_name_plural = "Configuración del local"

    def save(self, *args, **kwargs):
        self.dias_abiertos = [dia.lower().strip() for dia in self.dias_abiertos]
        super().save(*args, **kwargs)


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
        on_delete=models.PROTECT,
        related_name='turnos_como_cliente',
        db_column='id_cli'
    )

    fecha_hora_inicio = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    observaciones = models.TextField(blank=True, null=True)

    # NUEVOS CAMPOS DE PAGO 🔥🔥🔥
    comprobante_pago = models.FileField(
        upload_to='comprobantes/',
        null=True,
        blank=True
    )

    estado_pago = models.CharField(
        max_length=20,
        choices=[
            ('no_pagado', 'No pagado'),
            ('seña', 'Seña recibida'),
            ('pagado', 'Pago completo'),
        ],
        default='no_pagado'
    )

    fecha_pago = models.DateTimeField(null=True, blank=True)
    # --------------------------------------------------

    servicios = models.ManyToManyField(Servicio, through='TurnoServicio', related_name='turnos')

    class Meta:
        db_table = 'turnos'
        verbose_name = "Turno"
        verbose_name_plural = "Turnos"
        ordering = ['fecha_hora_inicio']
        constraints = [
            models.UniqueConstraint(
                fields=['fecha_hora_inicio'],
                name='turno_unico_fecha_hora'
            )
        ]

    def save(self, *args, **kwargs):
        # Detectar si cambiamos a completado
        recien_completado = False
        if self.pk:
            original = Turno.objects.get(pk=self.pk)
            if original.estado != 'completado' and self.estado == 'completado':
                recien_completado = True

        # Validación normal
        self.full_clean()
        super().save(*args, **kwargs)

        if recien_completado:
            self.procesar_consumo_insumos()

    def procesar_consumo_insumos(self):
        errores = []
        with transaction.atomic():
            for turno_servicio in self.servicios_asignados.all():
                servicio = turno_servicio.servicio
                ok, mensaje = servicio.consumir_stock()

                if not ok:
                    errores.append(f"Servicio {servicio.nombre}: {mensaje}")

            if errores:
                raise ValidationError("\n".join(errores))

    def __str__(self):
        return f"Turno {self.fecha_hora_inicio} - {self.cliente}"

    @property
    def duracion_total_minutos(self):
        if not self.pk:
            return 0
        datos = self.servicios_asignados.aggregate(total=Sum('duracion_servicio'))
        return datos['total'] or 0

    @property
    def fecha_hora_fin(self):
        if not self.fecha_hora_inicio:
            return None
        return self.fecha_hora_inicio + timedelta(minutes=self.duracion_total_minutos)

    def clean(self):
        if not self.pk:
            return
        config = ConfiguracionLocal.objects.first()
        if not config:
            raise ValidationError("Falta configuración del local.")

        dia = self.fecha_hora_inicio.strftime("%A").lower()
        mapa_dias = {
            "monday": "lunes",
            "tuesday": "martes",
            "wednesday": "miercoles",
            "thursday": "jueves",
            "friday": "viernes",
            "saturday": "sabado",
            "sunday": "domingo"
        }
        dia = mapa_dias.get(dia, dia)

        if dia not in config.dias_abiertos:
            raise ValidationError(f"Local cerrado los {dia}.")

        for ts in self.servicios_asignados.all():
            serv = ts.servicio
            if not serv.activo:
                raise ValidationError(f"Servicio '{serv.nombre}' inactivo.")
            if dia not in serv.dias_disponibles:
                raise ValidationError(f"Servicio '{serv.nombre}' no disponible los {dia}.")

    def descontar_stock(self):
        for turno_servicio in self.servicios_asignados.all():
            servicio = turno_servicio.servicio
            receta = servicio.insumos_receta.all()

            for item in receta:
                insumo = item.insumo
                cantidad_necesaria = item.cantidad

                if insumo.insumo_stock >= cantidad_necesaria:
                    insumo.insumo_stock -= cantidad_necesaria
                    insumo.save()
                else:
                    raise ValidationError(f"No hay suficiente stock de {insumo.insumo_nombre}")

    def save(self, *args, **kwargs):
        self.full_clean()
        if self.pk:
            try:
                old = Turno.objects.get(pk=self.pk)
                if old.estado != 'completado' and self.estado == 'completado':
                    with transaction.atomic():
                        self.descontar_stock()
            except Turno.DoesNotExist:
                pass

        super().save(*args, **kwargs)


class TurnoServicio(models.Model):
    id_turno_servicio = models.AutoField(primary_key=True)
    turno = models.ForeignKey(
        Turno,
        on_delete=models.CASCADE,
        db_column='id_turno',
        related_name='servicios_asignados'
    )
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, db_column='id_serv')
    duracion_servicio = models.PositiveIntegerField(default=30)

    class Meta:
        db_table = 'turnos_x_servicios'
        unique_together = ('turno', 'servicio')

    def save(self, *args, **kwargs):
        if (not self.duracion_servicio or self.duracion_servicio == 30) and self.servicio:
            if self.servicio.duracion > 0:
                self.duracion_servicio = self.servicio.duracion
        super().save(*args, **kwargs)
