from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.validators import MinValueValidator  # Importación correcta para validadores

class Caja(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role__in': ['admin', 'empleado']},
        help_text="Solo usuarios con rol 'admin' o 'empleado' pueden manejar la caja."
    )
    
    caja_estado = models.BooleanField(default=True, help_text="True: Abierta, False: Cerrada")
    caja_monto_inicial = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        validators=[MinValueValidator(0)]  # Ahora usa la importación correcta
    )
    caja_saldo_final = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        null=True, 
        blank=True, 
        validators=[MinValueValidator(0)]  # Ídem
    )
    caja_fecha_hora_apertura = models.DateTimeField(auto_now_add=True)
    caja_fecha_hora_cierre = models.DateTimeField(null=True, blank=True)
    caja_observacion = models.CharField(max_length=400, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Cajas"
        verbose_name = "Caja"
        # Regla: Un usuario no puede tener más de una caja abierta a la vez
        constraints = [
            models.UniqueConstraint(fields=['usuario'], condition=models.Q(caja_estado=True), name='unique_caja_abierta_por_usuario')
        ]
    
    def __str__(self):
        return f"Caja N°{self.id} - Apertura: {self.caja_fecha_hora_apertura.strftime('%Y-%m-%d %H:%M')}"
    
    def clean(self):
        # Validación: Solo admins/empleados
        if self.usuario.role not in ['admin', 'empleado']:
            raise ValidationError("Solo usuarios con rol 'admin' o 'empleado' pueden ser asignados a una caja.")
        
        # Validación: Monto inicial debe ser positivo (ya cubierto por validator, pero extra check)
        if self.caja_monto_inicial < 0:
            raise ValidationError("El monto inicial no puede ser negativo.")
        
        # Validación: No permitir cerrar una caja ya cerrada
        if self.caja_fecha_hora_cierre and not self.caja_estado:
            raise ValidationError("No se puede modificar una caja ya cerrada.")
        
        # Validación: Si está cerrada, debe tener saldo final
        if not self.caja_estado and self.caja_saldo_final is None:
            raise ValidationError("Debe especificar un saldo final al cerrar la caja.")
        
        super().clean()
    
    def save(self, *args, **kwargs):
        self.full_clean()  # Ejecuta validaciones
        
        # Regla de negocio: Al cerrar, calcular saldo final si no se proporciona (ejemplo simple: saldo inicial + ajustes)
        if not self.caja_estado and self.caja_saldo_final is None:
            # Aquí podrías integrar con transacciones de caja_registro para calcular real
            # Por ahora, asume que es igual al inicial (ajusta según tu lógica)
            self.caja_saldo_final = self.caja_monto_inicial  # Cambia esto si tienes transacciones
            self.caja_fecha_hora_cierre = timezone.now()
        
        super().save(*args, **kwargs)
    
    # Método útil: Cerrar caja
    def cerrar_caja(self, saldo_final=None, observacion=None):
        if self.caja_estado:
            self.caja_estado = False
            self.caja_saldo_final = saldo_final or self.caja_monto_inicial  # Lógica personalizable
            self.caja_fecha_hora_cierre = timezone.now()
            if observacion:
                self.caja_observacion = observacion
            self.save()
        else:
            raise ValidationError("La caja ya está cerrada.")
    
    # Propiedad: Calcular duración de la caja
    @property
    def duracion(self):
        if self.caja_fecha_hora_cierre:
            return self.caja_fecha_hora_cierre - self.caja_fecha_hora_apertura
        return timezone.now() - self.caja_fecha_hora_apertura