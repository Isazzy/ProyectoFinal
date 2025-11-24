# inventario/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

# --- MIXIN O CLASE ABSTRACTA (Opcional, para no repetir código) ---
# Pero lo pondré directo en tus modelos para no cambiar tu estructura demasiado.

class Marca(models.Model):
    nombre = models.CharField(max_length=120, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True, help_text="True = visible/activo, False = oculto/inactivo")

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"

    def __str__(self):
        return self.nombre

class Tipo_Producto(models.Model):
    tipo_producto_nombre = models.CharField(max_length=200)
    activo = models.BooleanField(default=True, help_text="True = visible/activo, False = oculto/inactivo")

    class Meta:
        verbose_name = 'Tipo de Producto'
        verbose_name_plural = 'Tipos de Productos'

    def __str__(self):
        return self.tipo_producto_nombre

class Categoria_Insumo(models.Model):
    categoria_insumo_nombre = models.CharField(max_length=200)
    activo = models.BooleanField(default=True, help_text="True = visible/activo, False = oculto/inactivo")

    class Meta:
        verbose_name = 'Categoría de Insumo'
        verbose_name_plural = 'Categorías de Insumos'

    def __str__(self):
        return self.categoria_insumo_nombre

class Producto(models.Model):
    tipo_producto = models.ForeignKey(Tipo_Producto, on_delete=models.PROTECT)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True, blank=True)
    producto_nombre = models.CharField(max_length=200)
    producto_descripcion = models.CharField(max_length=400, blank=True, null=True)
    producto_precio = models.DecimalField(max_digits=10, decimal_places=2)
    
    # FECHAS
    producto_fecha_hora_creacion = models.DateTimeField(auto_now_add=True)
    producto_fecha_actualizacion = models.DateTimeField(auto_now=True) # IMPORTANTE: Para tu regla de los 2 años

    stock = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    stock_minimo = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    producto_imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    producto_imagen_url = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True, help_text="True = visible/activo, False = oculto/inactivo")

    class Meta:
        verbose_name_plural = "Productos"
        verbose_name = "Producto"

    def __str__(self):
        marca_str = f" ({self.marca.nombre})" if self.marca else ""
        return f"{self.producto_nombre}{marca_str}"

    # REGLA DE NEGOCIO 1: Validaciones de integridad
    def clean(self):
        if self.producto_precio < 0:
            raise ValidationError({'producto_precio': "El precio no puede ser negativo."})
        if self.stock < 0:
            raise ValidationError({'stock': "El stock no puede ser negativo."})
        if self.stock_minimo < 0:
            raise ValidationError({'stock_minimo': "El stock mínimo no puede ser negativo."})

    def save(self, *args, **kwargs):
        self.full_clean() # Ejecuta validaciones antes de guardar
        super().save(*args, **kwargs)

    # REGLA DE NEGOCIO 2 (Tu ejemplo): Verificar si es obsoleto
    def es_obsoleto_para_borrar(self):
        """
        Retorna True si está inactivo, sin stock y no se ha actualizado en 2 años.
        """
        dos_anios_atras = timezone.now() - timedelta(days=730) # 365 * 2
        return (
            not self.activo and 
            self.stock == 0 and 
            self.producto_fecha_actualizacion <= dos_anios_atras
        )

class Insumo(models.Model):
    categoria_insumo = models.ForeignKey(Categoria_Insumo, on_delete=models.CASCADE)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True, blank=True)
    insumo_nombre = models.CharField(max_length=200)
    insumo_unidad = models.CharField(max_length=50, help_text="ej: 'g', 'ml', 'unidad'")
    insumo_stock = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    insumo_stock_minimo = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    
    # FECHAS
    insumo_fecha_actualizacion = models.DateTimeField(auto_now=True) # Para auditoría

    insumo_imagen = models.ImageField(upload_to='insumos/', blank=True, null=True)
    insumo_imagen_url = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Insumos"
        verbose_name = "Insumo"

    def __str__(self):
        marca_str = f" ({self.marca.nombre})" if self.marca else ""
        return f"{self.insumo_nombre}{marca_str}"

    # REGLA DE NEGOCIO 3: Normalización y Validación
    def clean(self):
        if self.insumo_stock < 0:
            raise ValidationError({'insumo_stock': "El stock no puede ser negativo."})

    def save(self, *args, **kwargs):
        # Normalizar unidad a minúsculas para evitar 'Ml', 'ml', 'ML'
        if self.insumo_unidad:
            self.insumo_unidad = self.insumo_unidad.lower().strip()
        self.full_clean()
        super().save(*args, **kwargs)