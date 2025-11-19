# caja_registro/models.py

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from caja.models import Caja  # Importa el modelo de caja
from venta.models import Ventas
from compra.models import Compra
from servicio.models import Servicio

class MovimientoCaja(models.Model):
    TIPO_MOVIMIENTO = [
        ('INGRESO', 'Ingreso por venta/servicio'),
        ('EGRESO', 'Egreso por compra'),
    ]

    caja = models.ForeignKey(
        Caja,
        on_delete=models.CASCADE,
        related_name='movimientos',
        help_text="Caja asociada al movimiento."
    )
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO)
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        help_text="Monto del movimiento (positivo)."
    )
    fecha_hora = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Usuario que realizó el movimiento."
    )
    motivo = models.CharField(max_length=255, help_text="Descripción del movimiento (e.g., 'Venta #123').")
    
    # Referencias opcionales a transacciones
    venta = models.ForeignKey(
        Ventas,  # En lugar de 'venta.Ventas'
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_caja'
    )
    compra = models.ForeignKey(
        Compra,  # En lugar de 'compra.Compra'
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_caja'
    )
    servicio = models.ForeignKey(
        Servicio,  # En lugar de 'servicio.Servicio'
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_caja'
    )

    class Meta:
        db_table = 'movimientos_caja'
        verbose_name = 'Movimiento de Caja'
        verbose_name_plural = 'Movimientos de Caja'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.tipo_movimiento} de ${self.monto} en Caja {self.caja.id} - {self.motivo}"

    def clean(self):
        # Validación: Solo movimientos en cajas abiertas
        if not self.caja.caja_estado:
            raise ValidationError("No se pueden registrar movimientos en cajas cerradas.")
        
        # Validación: Solo una referencia (venta, compra o servicio)
        referencias = [self.venta, self.compra, self.servicio]
        if sum(1 for ref in referencias if ref is not None) != 1:
            raise ValidationError("Debe haber exactamente una referencia (venta, compra o servicio).")
        
        # Validación: Tipo coincide con referencia
        if self.tipo_movimiento == 'INGRESO' and self.compra:
            raise ValidationError("Los ingresos no pueden referenciar compras.")
        if self.tipo_movimiento == 'EGRESO' and (self.venta or self.servicio):
            raise ValidationError("Los egresos no pueden referenciar ventas o servicios.")
        
        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()  # Ejecuta validaciones
        
        # Actualiza el saldo de la caja automáticamente
        if self.tipo_movimiento == 'INGRESO':
            self.caja.caja_saldo_final = (self.caja.caja_saldo_final or 0) + self.monto  # Asume caja_saldo_final como saldo actual
        elif self.tipo_movimiento == 'EGRESO':
            self.caja.caja_saldo_final = (self.caja.caja_saldo_final or 0) - self.monto
            if self.caja.caja_saldo_final < 0:
                raise ValidationError("El saldo de la caja no puede ser negativo.")
        
        self.caja.save()  # Guarda la caja con nuevo saldo
        super().save(*args, **kwargs)