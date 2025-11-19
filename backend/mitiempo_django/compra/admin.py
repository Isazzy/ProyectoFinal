from django.contrib import admin
from .models import Proveedores, productos_x_proveedores, Compra, DetalleCompra

@admin.register(Proveedores)
class ProveedoresAdmin(admin.ModelAdmin):
    list_display = ('id_prov', 'nombre_prov', 'tipo_prov', 'telefono', 'correo', 'activo')
    list_filter = ('activo', 'tipo_prov')
    search_fields = ('nombre_prov', 'correo')

@admin.register(productos_x_proveedores)
class ProductosXProveedoresAdmin(admin.ModelAdmin):
    list_display = ('id_prod', 'id_prov', 'precio_ultima_compra', 'd_compra')
    list_filter = ('d_compra',)
    search_fields = ('id_prod__nombre_prod', 'id_prov__nombre_prov')

@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = ('id_compra', 'proveedor', 'total_compra', 'estado', 'fecha_hs_comp', 'ro_usuario')
    list_filter = ('estado', 'fecha_hs_comp')
    search_fields = ('id_compra', 'proveedor__nombre_prov')

@admin.register(DetalleCompra)
class DetalleCompraAdmin(admin.ModelAdmin):
    list_display = ('id_det_comp', 'id_compra', 'producto', 'cantidad', 'precio_um', 'subtotal')
    list_filter = ('id_compra',)
    search_fields = ('producto__nombre_prod',)
