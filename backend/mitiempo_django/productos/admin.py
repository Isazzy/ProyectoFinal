from django.contrib import admin
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
from .models import Marca, Categoria, Productos, StockHistory

@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ("id_marca", "nombre")
    search_fields = ("nombre",)
    ordering = ("nombre",)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id_categoria", "nombre", "descripcion")
    search_fields = ("nombre", "descripcion")
    ordering = ("nombre",)

@admin.register(Productos)
class ProductosAdmin(admin.ModelAdmin):
    list_display = (
        "id_prod", "nombre_prod", "marca", "categoria",
        "precio_venta", "precio_compra", "stock_act_prod",
        "stock_min_prod", "reposicion_prod"
    )
    list_filter = ("marca", "categoria",)
    search_fields = ("nombre_prod", "marca__nombre", "categoria__nombre")
    ordering = ("nombre_prod",)
    readonly_fields = ("imagen_url",)
    # Muestra la imagen como un link clickeable en el admin
    def imagen(self, obj):
        if obj.imagen_url:
            return f'<a href="{obj.imagen_url}" target="_blank">Ver Imagen</a>'
        return ""
    imagen.allow_tags = True

    # Opcional: agregar raw_id_fields o autocomplete_fields si tienes muchos registros

@admin.register(StockHistory)
class StockHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id_history", "producto", "tipo_movimiento", "cantidad_movida",
        "stock_anterior", "stock_actual", "fecha_movimiento", "usuario", "razon"
    )
    list_filter = ("tipo_movimiento", "fecha_movimiento", "usuario")
    search_fields = ("producto__nombre_prod", "razon")
    ordering = ("-fecha_movimiento",)
    date_hierarchy = "fecha_movimiento"
<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))

