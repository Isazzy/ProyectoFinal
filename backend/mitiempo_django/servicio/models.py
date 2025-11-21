# servicios/models.py
from django.db import models
from datetime import timedelta
from django.db import transaction
from django.core.exceptions import ValidationError

# Asumimos que existe inventario.models.Insumo
try:
    from inventario.models import Insumo
except Exception:
    Insumo = None


class Servicio(models.Model):
    id_serv = models.AutoField(primary_key=True)
    
    # Categoría general: peluquería, manicura, depilación, etc.
    tipo_serv = models.CharField(max_length=100)
    
    nombre_serv = models.CharField(max_length=100)
    precio_serv = models.DecimalField(max_digits=9, decimal_places=2)

    duracion_minutos = models.PositiveIntegerField(
        default=30,
        help_text="Duración estimada del servicio en minutos."
    )

    # Ejemplo: ['lunes','martes','miercoles']
    dias_disponibles = models.JSONField(
        default=list,
        help_text="Ej: ['lunes', 'martes', 'miercoles']"
    )

    descripcion_serv = models.TextField(blank=True, null=True)

    # -----------------------
    # Estado booleano
    # -----------------------
    activado = models.BooleanField(
        default=True,
        help_text="True = visible/contratable, False = oculto/inactivo"
    )

    class Meta:
        managed = True
        db_table = 'servicios'
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        ordering = ["nombre_serv"]

    def __str__(self):
        estado = "Activo" if self.activado else "Inactivo"
        return f"{self.nombre_serv} ({self.duracion_minutos} min) - {estado}"

    # -----------------------------------------------------------
    # VALIDACIONES Y REGLAS DE NEGOCIO
    # -----------------------------------------------------------
    def clean(self):
        # 1) Validar que precio > 0
        if self.precio_serv <= 0:
            raise ValidationError("El precio debe ser mayor a 0.")

        # 2) Validar duración mínima lógica
        if self.duracion_minutos < 5:
            raise ValidationError("La duración mínima es de 5 minutos.")

        # 3) Validar que haya por lo menos 1 día disponible
        if not self.dias_disponibles:
            raise ValidationError("Debe seleccionar al menos un día disponible para el servicio.")

        # 4) Validar que los días sean correctos
        dias_validos = {
            "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
        }

        for d in self.dias_disponibles:
            if d.lower() not in dias_validos:
                raise ValidationError(f"'{d}' no es un día válido.")

    # Normalizar días al guardar
    def save(self, *args, **kwargs):
        if self.dias_disponibles is None:
            self.dias_disponibles = []
        else:
            self.dias_disponibles = [str(d).lower().strip() for d in self.dias_disponibles]

        self.full_clean()  # Aplica validaciones antes de guardar
        super().save(*args, **kwargs)

    # -----------------------------------------------------------
    # MÉTODOS DE LÓGICA PARA TURNOS
    # -----------------------------------------------------------
    def disponible_en_dia(self, dia_texto):
        """Ejemplo: servicio.disponible_en_dia('lunes')"""
        return dia_texto.lower().strip() in self.dias_disponibles

    # -----------------------------------------------------------
    # MÉTODOS PARA INSUMOS / RECETAS (originales del usuario)
    # -----------------------------------------------------------
    def get_receta(self):
        return self.servicioinsumo_set.select_related('insumo').all()

    def required_insumos_summary(self):
        return [
            {"insumo": si.insumo, "cantidad": si.cantidad_usada}
            for si in self.get_receta()
        ]

    def check_stock_suficiente(self):
        if Insumo is None:
            return False, "El modelo Insumo no está disponible."

        for si in self.get_receta():
            if si.insumo.insumo_stock < si.cantidad_usada:
                falta = si.cantidad_usada - si.insumo.insumo_stock
                return False, f"Falta stock para {si.insumo.insumo_nombre}: faltan {falta}."
        return True, None

    def consumir_stock(self):
        if Insumo is None:
            return False, "El modelo Insumo no está disponible."

        ok, msg = self.check_stock_suficiente()
        if not ok:
            return False, msg

        with transaction.atomic():
            for si in self.get_receta():
                ins = si.insumo
                nuevo = ins.insumo_stock - si.cantidad_usada
                if nuevo < 0:
                    raise ValidationError(f"Stock insuficiente al consumir {ins.insumo_nombre}")
                ins.insumo_stock = nuevo
                ins.save()
        return True, None


class ServicioInsumo(models.Model):
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    insumo = models.ForeignKey('inventario.Insumo', on_delete=models.PROTECT)
    cantidad_usada = models.DecimalField(max_digits=10, decimal_places=3)

    class Meta:
        verbose_name = "Insumo por Servicio"
        verbose_name_plural = "Insumos por Servicio"
        unique_together = ('servicio', 'insumo')

    def __str__(self):
        return f"{self.servicio.nombre_serv} -> {self.insumo.insumo_nombre} ({self.cantidad_usada})"

