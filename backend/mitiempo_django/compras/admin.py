from django.contrib import admin
<<<<<<< HEAD
=======
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
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)

# Register your models here.
