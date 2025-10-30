# productos/models.py
from django.db import models

<<<<<<< HEAD

# Stubs para satisfacer las FKs desde Compras/Ventas
class Cajas(models.Model):
    id_caja = models.AutoField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'cajas'

class Clientes(models.Model):
    id_cli = models.AutoField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'clientes'

class Proveedores(models.Model):
    id_prov = models.AutoField(primary_key=True)
    nombre_prov = models.CharField(max_length=100)
    tipo_prov = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.CharField(max_length=150, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'proveedores'

    def __str__(self):
        return self.nombre_prov

=======
>>>>>>> 874e3164 (reestructuracion de archivos)

# --- Modelo para Marcas ---
class Marca(models.Model):
    id_marca = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True) # unique=True evita duplicados

    class Meta:
        db_table = "marcas"
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"

    def __str__(self):
        return self.nombre
<<<<<<< HEAD

# --- Modelo para Categorías ---
# (Reemplaza al antiguo campo 'tipo_prod')
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
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

# --- Modelo Principal de Productos ---
class Productos(models.Model):
    id_prod = models.AutoField(primary_key = True)
    nombre_prod = models.CharField(max_length=100)
    
    # Conexión a Marca
    marca = models.ForeignKey(
        Marca, 
        on_delete=models.SET_NULL, # Si borras la marca, el producto no se borra
        null=True, 
        blank=True,
        related_name="productos"
    )
    
    # Conexión a Categoria
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL, # Si borras la categoría, no borres el producto
        null=True,
        blank=True,
        related_name="productos"
    )

    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2)
    stock_min_prod = models.IntegerField()
<<<<<<< HEAD
    stock_act_prod = models.IntegerField(default=0) # Valor por defecto 0
    reposicion_prod = models.IntegerField()
    stock_max_prod = models.IntegerField()
=======
    stock_act_prod = models.IntegerField(default=0) 
    reposicion_prod = models.IntegerField()
    stock_max_prod = models.IntegerField()
    imagen_url = models.URLField(max_length=300, blank=True, null=True)
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)

    class Meta:
<<<<<<< HEAD
        managed = False
        db_table = 'productos'
        indexes = [
            models.Index(fields=['nombre_prod']),
            models.Index(fields=['tipo_prod']),
        ]
=======
        # Se quitó 'managed = False' para que Django cree la tabla
        db_table = "productos"
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
>>>>>>> 874e3164 (reestructuracion de archivos)

    def __str__(self):
        # Muestra el nombre y la marca si existe
        if self.marca:
            return f"{self.nombre_prod} ({self.marca.nombre})"
        return self.nombre_prod
<<<<<<< HEAD

<<<<<<< HEAD

class Compras(models.Model):
    id_compra = models.AutoField(primary_key=True)
    nro_comp = models.IntegerField()
    fecha_hs_comp = models.DateTimeField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=9)
    id_caja = models.ForeignKey('Cajas', models.PROTECT, db_column='id_caja')  # opcional si usás caja

    class Meta:
        managed = False
        db_table = 'compras'


class DetCompras(models.Model):
    id_det_comp = models.AutoField(primary_key=True)
    cantidad = models.IntegerField()
    precio_uni = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    id_comp = models.ForeignKey(Compras, models.CASCADE, db_column='id_comp', related_name='detalles')
    # Si tu esquema original no tiene FK a Productos aquí, omitilo; si existe, agregalo:
    # id_prod = models.ForeignKey(Productos, models.PROTECT, db_column='id_prod', related_name='compras_detalle')

    class Meta:
        managed = False
        db_table = 'det_compras'


class Ventas(models.Model):
    id_venta = models.AutoField(primary_key=True)
    fech_hs_vent = models.DateTimeField()
    tipo_venta = models.CharField(max_length=100)
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(max_length=100)
    cliente = models.ForeignKey('Clientes', models.PROTECT)
    id_caja = models.ForeignKey('Cajas', models.PROTECT, db_column='id_caja')

    class Meta:
        managed = False
        db_table = 'ventas'


class DetVentas(models.Model):
    id_det_venta = models.AutoField(primary_key=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_venta = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    id_prod = models.ForeignKey(Productos, models.PROTECT, db_column='id_prod', related_name='ventas_detalle', blank=True, null=True)
    id_venta = models.ForeignKey(Ventas, models.CASCADE, db_column='id_venta', related_name='detalles')

    class Meta:
        managed = False
        db_table = 'det_ventas'


class ProductosXProveedores(models.Model):
    id_prod_x_prov = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(Compras, models.PROTECT, db_column='id_compra', related_name='productos_proveedor')
    id_prod = models.ForeignKey(Productos, models.PROTECT, db_column='id_prod', related_name='proveedor_rel')
    id_prov = models.ForeignKey(Proveedores, models.PROTECT, db_column='id_prov', related_name='productos_rel')

    class Meta:
        managed = False
        db_table = 'productos_x_proveedores'
        unique_together = (('id_compra', 'id_prod', 'id_prov'),)
=======

# --- Modelo para Historial de Stock ---
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
class StockHistory(models.Model):
    """Modelo para registrar cada movimiento de stock (entrada/salida)."""
    
    TIPO_MOVIMIENTO = [
        ('ENTRADA', 'Entrada por compra/reposición'),
        ('SALIDA', 'Salida por venta/uso'),
        ('AJUSTE', 'Ajuste manual de inventario'),
    ]

    id_history = models.AutoField(primary_key=True)
    
    # Relación con el producto al que afecta
    producto = models.ForeignKey(
        Productos, 
        on_delete=models.SET_NULL,  # <-- CAMBIA A SET_NULL
        null=True,                  # <-- AÑADE ESTO
        blank=True,                 # <-- AÑADE ESTO
        related_name='stock_movements'
    )
    
    fecha_movimiento = models.DateTimeField(auto_now_add=True) # Se establece automáticamente
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO)
    cantidad_movida = models.IntegerField()
    stock_anterior = models.IntegerField()
    stock_actual = models.IntegerField()
    razon = models.CharField(max_length=255, blank=True, null=True) # Ej: "Venta Ticket 102"
    
    # Campo para registrar quién hizo el movimiento (dueña/empleado)
    usuario = models.ForeignKey(
<<<<<<< HEAD
        'mitiempo_enloderomi.CustomUser', # <--- USA EL STRING 'app.Modelo'
=======
        'mitiempo_enloderomi.CustomUser',
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    ) 

    class Meta:
        # Se quitó 'managed = False'
        db_table = "stock_history"
        verbose_name = "Historial de Stock"
        verbose_name_plural = "Historiales de Stock"
<<<<<<< HEAD

    def __str__(self):
        return f'{self.tipo_movimiento} de {self.cantidad_movida} para {self.producto.nombre_prod}'
>>>>>>> 874e3164 (reestructuracion de archivos)
=======
    def __str__(self):
        return f'{self.tipo_movimiento} de {self.cantidad_movida} para {self.producto.nombre_prod}'
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
