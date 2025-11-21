# inventario/models.py
from django.db import models

class Marca(models.Model):
    nombre = models.CharField(max_length=120, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"

    def __str__(self):
        return self.nombre


class Tipo_Producto(models.Model):
    tipo_producto_nombre = models.CharField(max_length=200)

    class Meta:
        verbose_name = 'Tipo de Producto'
        verbose_name_plural = 'Tipos de Productos'

    def __str__(self):
        return self.tipo_producto_nombre


class Categoria_Insumo(models.Model):
    categoria_insumo_nombre = models.CharField(max_length=200)

    class Meta:
        verbose_name = 'Categoría de Insumo'
        verbose_name_plural = 'Categorías de Insumos'

    def __str__(self):
        return self.categoria_insumo_nombre


class Producto(models.Model):
    # Producto vendible al cliente (ej. shampoo, kit, ampolla)
    tipo_producto = models.ForeignKey(Tipo_Producto, on_delete=models.PROTECT)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True, blank=True)
    producto_nombre = models.CharField(max_length=200)
    producto_descripcion = models.CharField(max_length=400, blank=True, null=True)
    producto_precio = models.DecimalField(max_digits=10, decimal_places=2)
    producto_disponible = models.BooleanField(default=True)
    producto_fecha_hora_creacion = models.DateTimeField(auto_now_add=True)

    producto_imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    producto_imagen_url = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Productos"
        verbose_name = "Producto"

    def __str__(self):
        if self.marca:
            return f"{self.producto_nombre} ({self.marca.nombre})"
        return self.producto_nombre


class Insumo(models.Model):
    # Insumos (lo que realmente está en stock): tintura, oxidante, guantes, algodón, etc.
    categoria_insumo = models.ForeignKey(Categoria_Insumo, on_delete=models.CASCADE)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True, blank=True)
    insumo_nombre = models.CharField(max_length=200)
    insumo_unidad = models.CharField(max_length=50, help_text="ej: 'g', 'ml', 'unidad'")
    insumo_stock = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    insumo_stock_minimo = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    insumo_imagen = models.ImageField(upload_to='insumos/', blank=True, null=True)
    insumo_imagen_url = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Insumos"
        verbose_name = "Insumo"

    def __str__(self):
        if self.marca:
            return f"{self.insumo_nombre} ({self.marca.nombre})"
        return self.insumo_nombre


class Producto_X_Insumo(models.Model):
    # "Receta" para un producto vendible (kit, pack) - disminuye stock cuando se vende un producto
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='receta')
    insumo = models.ForeignKey(Insumo, on_delete=models.PROTECT)
    producto_insumo_cantidad = models.DecimalField(max_digits=12, decimal_places=3,
                                                   help_text="Cantidad de insumo consumido por unidad de producto")

    class Meta:
        verbose_name_plural = "Productos por Insumos"
        verbose_name = "Producto por Insumo"
        unique_together = ('producto', 'insumo')

    def __str__(self):
        return f'{self.producto.producto_nombre} - {self.insumo.insumo_nombre}'
