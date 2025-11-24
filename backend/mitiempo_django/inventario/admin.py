from django.contrib import admin
from .models import (
    Tipo_Producto, 
    Categoria_Insumo, 
    Producto, 
    Insumo, 
    Marca
)

# --- MARCA ---
@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'descripcion', 'activo') # Agregado activo
    list_display_links = ('nombre',)
    search_fields = ('nombre',)
    list_filter = ('activo',) # Filtro para ver borrados vs activos
    list_editable = ('activo',) # Permite activar/desactivar rápido desde la lista
    ordering = ('nombre',)

# --- TIPO DE PRODUCTO ---
@admin.register(Tipo_Producto)
class Tipo_ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_producto_nombre', 'activo')
    list_display_links = ('tipo_producto_nombre',)
    search_fields = ('tipo_producto_nombre',)
    list_filter = ('activo',)
    list_editable = ('activo',)

# --- CATEGORÍA DE INSUMO ---
@admin.register(Categoria_Insumo)
class Categoria_InsumoAdmin(admin.ModelAdmin):
    list_display = ('id', 'categoria_insumo_nombre', 'activo')
    list_display_links = ('categoria_insumo_nombre',)
    search_fields = ('categoria_insumo_nombre',)
    list_filter = ('activo',)
    list_editable = ('activo',)


# --- PRODUCTO ---
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        'producto_nombre', 
        'marca', 
        'tipo_producto', 
        'producto_precio', 
        'stock', 
        'stock_minimo', # Útil ver el mínimo al lado del stock real
        'activo'
    )
    list_display_links = ('producto_nombre',)
    search_fields = ('producto_nombre', 'producto_descripcion', 'marca__nombre')
    
    # Filtros útiles: Por estado (activo), tipo, marca y si el stock es 0
    list_filter = ('activo', 'tipo_producto', 'marca')
    
    # Edición rápida de precio y stock sin entrar al detalle
    list_editable = ('producto_precio', 'stock', 'activo')
    
    list_per_page = 25
    ordering = ('producto_nombre',)
    
    # Fechas automáticas siempre solo lectura
    readonly_fields = ('producto_fecha_hora_creacion', 'producto_fecha_actualizacion') 
    
    # Organizar campos en el detalle
    fieldsets = (
        ('Información Básica', {
            'fields': ('producto_nombre', 'tipo_producto', 'marca', 'producto_precio', 'producto_descripcion')
        }),
        ('Inventario', {
            'fields': ('stock', 'stock_minimo', 'activo')
        }),
        ('Multimedia', {
            'fields': ('producto_imagen', 'producto_imagen_url')
        }),
        ('Auditoría', {
            'fields': ('producto_fecha_hora_creacion', 'producto_fecha_actualizacion')
        }),
    )


# --- INSUMO ---
@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = (
        'insumo_nombre', 
        'marca', 
        'categoria_insumo', 
        'insumo_unidad', 
        'insumo_stock', 
        'insumo_stock_minimo',
        'activo'
    )
    list_display_links = ('insumo_nombre',)
    search_fields = ('insumo_nombre', 'marca__nombre')
    
    list_filter = ('activo', 'categoria_insumo', 'marca')
    list_editable = ('insumo_stock', 'insumo_stock_minimo', 'activo')
    
    list_per_page = 25
    ordering = ('insumo_nombre',)
    
    readonly_fields = ('insumo_fecha_actualizacion',) # Si agregaste este campo en models

    fieldsets = (
        ('Detalle', {
            'fields': ('insumo_nombre', 'categoria_insumo', 'marca', 'insumo_unidad')
        }),
        ('Inventario', {
            'fields': ('insumo_stock', 'insumo_stock_minimo', 'activo')
        }),
        ('Multimedia', {
            'fields': ('insumo_imagen', 'insumo_imagen_url')
        }),
        ('Auditoría', {
            'fields': ('insumo_fecha_actualizacion',) # Asegúrate que exista en el modelo
        }),
    )