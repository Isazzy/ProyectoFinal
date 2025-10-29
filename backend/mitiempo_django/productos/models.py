from django.db import models

# Create your models here.

class Productos(models.Model):
    id_prod = models.AutoField(primary_key = True)
    nombre_prod = models.CharField(max_length=100)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2)
    stock_min_prod = models.IntegerField()
    stock_act_prod = models.IntegerField()
    reposicion_prod = models.IntegerField()
    stock_max_prod = models.IntegerField()
    tipo_prod = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = "productos"

    def __str__(self):
        return self.nombre_prod
    
# productos/models.py
class StockHistory(models.Model):
    """Modelo para registrar cada movimiento de stock (entrada/salida)."""
    
    TIPO_MOVIMIENTO = [
        ('ENTRADA', 'Entrada por compra/reposición'),
        ('SALIDA', 'Salida por venta/uso'),
        ('AJUSTE', 'Ajuste manual de inventario'),
    ]

    id_history = models.AutoField(primary_key=True)
    
    # Relación con el producto al que afecta
    producto = models.ForeignKey(Productos, on_delete=models.PROTECT, related_name='stock_movements')
    
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO)
    cantidad_movida = models.IntegerField()
    stock_anterior = models.IntegerField()
    stock_actual = models.IntegerField()
    razon = models.CharField(max_length=255, blank=True, null=True)
    
    # Campo para registrar quién hizo el movimiento (si tienes autenticación de usuario)
    # usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) 

    class Meta:
        managed = False
        db_table = "stock_history"
        verbose_name = "Historial de Stock"
        verbose_name_plural = "Historiales de Stock"

    def __str__(self):
        return f'{self.tipo_movimiento} de {self.cantidad_movida} para {self.producto.nombre_prod} en {self.fecha_movimiento.strftime("%Y-%m-%d %H:%M")}'
