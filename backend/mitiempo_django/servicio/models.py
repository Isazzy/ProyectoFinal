# servicios/models.py
from django.db import models
from datetime import timedelta
from django.db import transaction
from django.core.exceptions import ValidationError

# Intentamos importar Insumo (si no existe, dejamos None y validamos luego)
try:
    from inventario.models import Insumo
except Exception:
    Insumo = None


class Servicio(models.Model):
    
    id_serv = models.AutoField(primary_key=True)
    tipo_serv = models.CharField(max_length=100, help_text="Categoría: peluquería, manicura, etc.")
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=9, decimal_places=2)
    duracion = models.PositiveIntegerField(
        default=30,
        help_text="Duración estimada del servicio en minutos."
    )

    dias_disponibles = models.JSONField(
        default=list,
        help_text="Ej: ['lunes','martes','miercoles']"
    )


    descripcion = models.TextField(blank=True, null=True)

    activo = models.BooleanField(
        default=True,
        help_text="True = visible/contratable, False = oculto/inactivo"
    )

    class Meta:
        db_table = "servicios"
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        ordering = ["nombre"]

    def __str__(self):
        estado = "Activo" if self.activo else "Inactivo"
        return f"{self.nombre} ({self.duracion} min) - {estado}"

    # -------------------------
    # Validaciones
    # -------------------------
    def clean(self):
        if self.precio <= 0:
            raise ValidationError("El precio debe ser mayor a 0.")
        if self.duracion < 5:
            raise ValidationError("La duración mínima es de 5 minutos.")
        if not self.dias_disponibles:
            raise ValidationError("Debe seleccionar al menos un día disponible.")
        dias_validos = {"lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"}
        for d in self.dias_disponibles:
            if str(d).lower().strip() not in dias_validos:
                raise ValidationError(f"'{d}' no es un día válido.")

    def save(self, *args, **kwargs):
        if self.dias_disponibles is None:
            self.dias_disponibles = []
        else:
            self.dias_disponibles = [str(d).lower().strip() for d in self.dias_disponibles]
        self.full_clean()
        super().save(*args, **kwargs)

    # -------------------------
    # Receta (insumos) helpers
    # -------------------------
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
        """
        Descuenta stock según la receta del servicio.
        Retorna (True, None) si OK, o (False, mensaje).
        """
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
    """
    Relación: cuánto insumo consume un servicio.
    """
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    insumo = models.ForeignKey('inventario.Insumo', on_delete=models.PROTECT)
    cantidad_usada = models.DecimalField(max_digits=12, decimal_places=3)

    class Meta:
        verbose_name = "Insumo por Servicio"
        verbose_name_plural = "Insumos por Servicio"
        unique_together = ('servicio', 'insumo')

    def __str__(self):
        return f"{self.servicio.nombre} -> {self.insumo.insumo_nombre} ({self.cantidad_usada})"
