from django.contrib import admin
from .models import Tipo_Producto, Categoria_Insumo, Producto, Insumo, Producto_X_Insumo

# Register your models here.

class Tipo_ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_producto_nombre')
    list_display_links = ('id', 'tipo_producto_nombre')
    search_fields = ('tipo_producto_nombre',)
    list_per_page = 25

admin.site.register(Tipo_Producto, Tipo_ProductoAdmin)


class Categoria_InsumoAdmin(admin.ModelAdmin):
    list_display = ('id', 'categoria_insumo_nombre')
    list_display_links = ('id', 'categoria_insumo_nombre')
    search_fields = ('categoria_insumo_nombre',)
    list_per_page = 25

admin.site.register(Categoria_Insumo, Categoria_InsumoAdmin)


class ProductoAdmin(admin.ModelAdmin):
    list_display = ('producto_nombre', 'tipo_producto', 'producto_precio', 'producto_disponible', 'producto_fecha_hora_creacion')
    list_display_links = ('producto_nombre',)
    search_fields = ('producto_nombre', 'producto_descripcion')
    list_filter = ('tipo_producto', 'producto_disponible')
    list_editable = ('producto_precio', 'producto_disponible')
    list_per_page = 25
    ordering = ('producto_nombre',)
    readonly_fields = ('producto_fecha_hora_creacion',)

admin.site.register(Producto, ProductoAdmin)


class InsumoAdmin(admin.ModelAdmin):
    # Eliminamos 'insumo_precio_compra' de list_display
    list_display = ('insumo_nombre', 'categoria_insumo', 'insumo_unidad', 'insumo_stock', 'insumo_stock_minimo')
    list_display_links = ('insumo_nombre',)
    search_fields = ('insumo_nombre',)
    list_filter = ('categoria_insumo',)
    # Eliminamos 'insumo_precio_compra' de list_editable
    list_editable = ('insumo_stock', 'insumo_stock_minimo')
    list_per_page = 25
    ordering = ('insumo_nombre',)

admin.site.register(Insumo, InsumoAdmin)


class Producto_X_InsumoAdmin(admin.ModelAdmin):
    list_display = ('producto', 'insumo', 'producto_insumo_cantidad')
    list_display_links = ('producto', 'insumo')
    search_fields = ('producto__producto_nombre', 'insumo__insumo_nombre')
    list_filter = ('producto', 'insumo')
    list_per_page = 25
    autocomplete_fields = ('producto', 'insumo')

admin.site.register(Producto_X_Insumo, Producto_X_InsumoAdmin)
