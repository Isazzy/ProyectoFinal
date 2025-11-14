<<<<<<< HEAD
<<<<<<< HEAD
=======
# compras/models.py

>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.core.exceptions import ValidationError  # Nueva importación para validaciones


# Importar modelo de productos
from productos.models import Productos


from django.conf import settings


class Proveedores(models.Model):
    """Modelo Proveedor basado en tabla PROVEEDORES"""
    
    # Mapeo exacto de tu BD
    id_prov = models.AutoField(primary_key=True)
    nombre_prov = models.CharField(max_length=200, verbose_name="Nombre del Proveedor")
    tipo_prov = models.CharField(max_length=100, blank=True, verbose_name="Tipo de Proveedor")
    telefono = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    
    # Campos adicionales útiles
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Nueva regla: Validar que el proveedor existe antes de modificar (solo para actualizaciones)
        if self.pk and not Proveedores.objects.filter(pk=self.pk).exists():
            raise ValidationError("El proveedor no existe en la base de datos y no puede ser modificado.")
        super().save(*args, **kwargs)
    def delete(self, *args, **kwargs):
        # Nueva regla: No eliminar si tiene compras o productos asociados
        if self.compras.exists() or self.productos_proveedor.exists():
            raise ValidationError("No se puede eliminar un proveedor con compras o productos asociados.")
        super().delete(*args, **kwargs)
    
    class Meta:
        db_table = 'proveedores'
        managed = True
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        ordering = ['nombre_prov']
    
    def __str__(self):
        return f"{self.nombre_prov}"


class productos_x_proveedores(models.Model):
    """Relación Producto-Proveedor con historial de compras"""
    
    id_prod_x_prov = models.AutoField(primary_key=True)
    id_prod = models.ForeignKey(
        Productos, 
        on_delete=models.PROTECT, 
        db_column='id_prod',
        related_name='proveedores_producto'
    )
    id_prov = models.ForeignKey(
        Proveedores, 
        on_delete=models.PROTECT, 
        db_column='id_prov',
        related_name='productos_proveedor'
    )
    d_compra = models.DateField(verbose_name="Fecha de Compra", null=True, blank=True)
    
    # Campos útiles adicionales
    precio_ultima_compra = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    def delete(self, *args, **kwargs):
        # Nueva regla: No eliminar si hay compras recientes (últimos 30 días) para este producto-proveedor
        from django.utils import timezone
        from datetime import timedelta
        fecha_limite = timezone.now().date() - timedelta(days=30)
        if self.id_prod.detalles_compra.filter(id_compra__fecha_hs_comp__date__gte=fecha_limite).exists():
            raise ValidationError("No se puede eliminar una relación producto-proveedor con compras recientes.")
        super().delete(*args, **kwargs)

    class Meta:
<<<<<<< HEAD
        managed = True
        db_table = 'productos_x_proveedores'
=======
# compras/models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.core.exceptions import ValidationError  # Nueva importación para validaciones


# Importar modelo de productos
from productos.models import Productos


from django.conf import settings


class Proveedores(models.Model):
    """Modelo Proveedor basado en tabla PROVEEDORES"""
    
    # Mapeo exacto de tu BD
    id_prov = models.AutoField(primary_key=True)
    nombre_prov = models.CharField(max_length=200, verbose_name="Nombre del Proveedor")
    tipo_prov = models.CharField(max_length=100, blank=True, verbose_name="Tipo de Proveedor")
    telefono = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    
    # Campos adicionales útiles
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Nueva regla: Validar que el proveedor existe antes de modificar (solo para actualizaciones)
        if self.pk and not Proveedores.objects.filter(pk=self.pk).exists():
            raise ValidationError("El proveedor no existe en la base de datos y no puede ser modificado.")
        super().save(*args, **kwargs)
    def delete(self, *args, **kwargs):
        # Nueva regla: No eliminar si tiene compras o productos asociados
        if self.compras.exists() or self.productos_proveedor.exists():
            raise ValidationError("No se puede eliminar un proveedor con compras o productos asociados.")
        super().delete(*args, **kwargs)
    
    class Meta:
        db_table = 'proveedores'
        managed = True
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        ordering = ['nombre_prov']
    
    def __str__(self):
        return f"{self.nombre_prov}"


class productos_x_proveedores(models.Model):
    """Relación Producto-Proveedor con historial de compras"""
    
    id_prod_x_prov = models.AutoField(primary_key=True)
    id_prod = models.ForeignKey(
        Productos, 
        on_delete=models.PROTECT, 
        db_column='id_prod',
        related_name='proveedores_producto'
    )
    id_prov = models.ForeignKey(
        Proveedores, 
        on_delete=models.PROTECT, 
        db_column='id_prov',
        related_name='productos_proveedor'
    )
    d_compra = models.DateField(verbose_name="Fecha de Compra", null=True, blank=True)
    
    # Campos útiles adicionales
    precio_ultima_compra = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    def delete(self, *args, **kwargs):
        # Nueva regla: No eliminar si hay compras recientes (últimos 30 días) para este producto-proveedor
        from django.utils import timezone
        from datetime import timedelta
        fecha_limite = timezone.now().date() - timedelta(days=30)
        if self.id_prod.detalles_compra.filter(id_compra__fecha_hs_comp__date__gte=fecha_limite).exists():
            raise ValidationError("No se puede eliminar una relación producto-proveedor con compras recientes.")
        super().delete(*args, **kwargs)

    class Meta:
=======
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
        db_table = 'productos_x_proveedores'
        verbose_name = 'Producto por Proveedor'
        verbose_name_plural = 'Productos por Proveedores'
        unique_together = [['id_prod', 'id_prov']]
    
    def __str__(self):
        return f"{self.id_prod} - {self.id_prov}"


class Compra(models.Model):
    """Modelo Compra basado en tabla COMPRAS"""
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADA', 'Completada'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    id_compra = models.AutoField(primary_key=True)
    id_caja = models.IntegerField(verbose_name="ID Caja")  # Relación con tu modelo de caja
    fecha_hs_comp = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Fecha y Hora de Compra"
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='PENDIENTE'
    )
    ro_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        db_column='ro_usuario',
        related_name='compras_realizadas'
    )
    
    # Campos adicionales para control
    proveedor = models.ForeignKey(
        Proveedores,
        on_delete=models.PROTECT,
        related_name='compras',
        null=True
    )
    total_compra = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name="Total de Compra"
    )
    metodo_pago = models.CharField(max_length=50, default='EFECTIVO')
    notas = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        # Nueva regla: No permitir cambios en estado si ya está completada
        if self.pk:
            original = Compra.objects.get(pk=self.pk)
            if original.estado == 'COMPLETADA' and self.estado != 'COMPLETADA':
                raise ValidationError("No se puede cambiar el estado de una compra completada.")
        super().save(*args, **kwargs)
    def delete(self, *args, **kwargs):
        # Nueva regla: No eliminar compras completadas
        if self.estado == 'COMPLETADA':
            raise ValidationError("No se puede eliminar una compra completada.")
        super().delete(*args, **kwargs)


    class Meta:
        db_table = 'COMPRAS'
        verbose_name = 'Compra'
        verbose_name_plural = 'Compras'
        ordering = ['-fecha_hs_comp']
    
    def __str__(self):
        return f"Compra #{self.id_compra} - {self.fecha_hs_comp.strftime('%d/%m/%Y')}"
    
    def calcular_total(self):
        """Calcula el total sumando todos los detalles"""
        total = sum(detalle.total for detalle in self.detalles.all())
        self.total_compra = total
        self.save()
        return total


class DetalleCompra(models.Model):
    """Modelo Detalle de Compra basado en DET_COMPRAS"""
    
    id_det_comp = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(
        Compra,
        on_delete=models.CASCADE,
        db_column='id_compra',
        related_name='detalles'
    )
    producto = models.ForeignKey(
        Productos,
        on_delete=models.PROTECT,
        related_name='detalles_compra',
        null=True
    )
    cantidad = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Cantidad"
    )
    precio_um = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Precio Unitario"
    )
    subtotal = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )
    total = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )

    def save(self, *args, **kwargs):
        # Nueva regla: Validar stock disponible en el producto (asumiendo campo 'stock' en Productos)
        if self.producto and hasattr(self.producto, 'stock') and self.cantidad > self.producto.stock:
            raise ValidationError(f"Stock insuficiente para {self.producto.nombre_prod}. Disponible: {self.producto.stock}")
        # Calcular subtotal y total (ya existe, pero reforzado)
        self.subtotal = self.cantidad * self.precio_um
        self.total = self.subtotal
        super().save(*args, **kwargs)
        # Actualizar total de la compra (ya existe)
    
    class Meta:
        db_table = 'DET_COMPRAS'
        verbose_name = 'Detalle de Compra'
        verbose_name_plural = 'Detalles de Compras'
    
    def __str__(self):
        return f"Detalle #{self.id_det_comp} - Compra #{self.id_compra_id}"
    
    def save(self, *args, **kwargs):
        """Calcula automáticamente subtotal y total antes de guardar"""
        self.subtotal = self.cantidad * self.precio_um
        self.total = self.subtotal  # Por ahora sin impuestos, puedes agregar lógica
        super().save(*args, **kwargs)
        
        # Actualizar total de la compra
        if self.id_compra:
<<<<<<< HEAD
            self.id_compra.calcular_total()
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
            self.id_compra.calcular_total()
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
