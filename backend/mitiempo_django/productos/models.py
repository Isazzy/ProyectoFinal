# productos/models.py
from django.db import models

class Marca(models.Model):
    id_marca = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True) 

    class Meta:
        db_table = "marcas"
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"

    def __str__(self):
        return self.nombre
class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "categorias"
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.nombre
    
class Productos(models.Model):
    id_prod = models.AutoField(primary_key = True)
    nombre_prod = models.CharField(max_length=100)
    
    marca = models.ForeignKey(
        Marca, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name="productos"
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="productos"
    )

    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2)
    stock_min_prod = models.IntegerField()
    stock_act_prod = models.IntegerField(default=0) 
    reposicion_prod = models.IntegerField()
    stock_max_prod = models.IntegerField()
    imagen_url = models.URLField(max_length=300, blank=True, null=True)

    class Meta:
        db_table = "productos"
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        if self.marca:
            return f"{self.nombre_prod} ({self.marca.nombre})"
        return self.nombre_prod

class StockHistory(models.Model):
    
    TIPO_MOVIMIENTO = [
        ('ENTRADA', 'Entrada por compra/reposición'),
        ('SALIDA', 'Salida por venta/uso'),
        ('AJUSTE', 'Ajuste manual de inventario'),
    ]

    id_history = models.AutoField(primary_key=True)
    producto = models.ForeignKey(
        Productos, 
        on_delete=models.SET_NULL,  
        null=True,               
        blank=True,              
        related_name='stock_movements'
    )
    
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO)
    cantidad_movida = models.IntegerField()
    stock_anterior = models.IntegerField()
    stock_actual = models.IntegerField()
    razon = models.CharField(max_length=255, blank=True, null=True) 

    usuario = models.ForeignKey(
        'mitiempo_enloderomi.CustomUser',
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    ) 

    class Meta:
        db_table = "stock_history"
        verbose_name = "Historial de Stock"
        verbose_name_plural = "Historiales de Stock"
    def __str__(self):
        return f'{self.tipo_movimiento} de {self.cantidad_movida} para {self.producto.nombre_prod}'