from django.contrib import admin
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
from .models import Proveedores, Compra, DetalleCompra, productos_x_proveedores

@admin.register(Proveedores)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['id_prov', 'nombre_prov', 'tipo_prov', 'telefono', 'activo']
    search_fields = ['nombre_prov', 'correo']
    list_filter = ['tipo_prov', 'activo']

@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = ['id_compra', 'proveedor', 'fecha_hs_comp', 'total_compra', 'estado']
    list_filter = ['estado', 'fecha_hs_comp']
    search_fields = ['id_compra']

@admin.register(DetalleCompra)
class DetalleCompraAdmin(admin.ModelAdmin):
    list_display = ['id_det_comp', 'id_compra', 'producto', 'cantidad', 'precio_um', 'total']

@admin.register(productos_x_proveedores)
class ProductoXProveedorAdmin(admin.ModelAdmin):
    list_display = ['id_prod', 'id_prov', 'd_compra', 'precio_ultima_compra']
<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)

# Register your models here.
