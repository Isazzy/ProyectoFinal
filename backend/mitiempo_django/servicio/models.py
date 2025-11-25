# servicios/models.py
from django.db import models
from datetime import timedelta
<<<<<<< HEAD

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
=======
from django.db import transaction
from django.core.exceptions import ValidationError
from django.apps import apps # Importante para evitar ciclos

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
        # Obtenemos el modelo dinámicamente para evitar circular imports al inicio del archivo
        Insumo = apps.get_model('inventario', 'Insumo') 
        
        receta = self.servicioinsumo_set.all()
        
        # 1. Validar primero (evita descontar la mitad y fallar luego)
        for item in receta:
            if item.insumo.insumo_stock < item.cantidad_usada:
                return False, f"Falta stock de {item.insumo.insumo_nombre}"

        # 2. Descontar
        with transaction.atomic():
            for item in receta:
                insumo = item.insumo
                insumo.insumo_stock -= item.cantidad_usada
                insumo.save()
                
        return True, None


class ServicioInsumo(models.Model):
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name='insumos_receta')
    # Usamos string 'inventario.Insumo' para evitar conflictos de importación
    insumo = models.ForeignKey('inventario.Insumo', on_delete=models.PROTECT) 
    cantidad = models.DecimalField(max_digits=10, decimal_places=3)

    class Meta:
        db_table = "servicioInsumo"
        unique_together = ('servicio', 'insumo')
        verbose_name = "Insumo por Servicio"

    def __str__(self):
        return f"{self.servicio.nombre} usa {self.cantidad}"
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
