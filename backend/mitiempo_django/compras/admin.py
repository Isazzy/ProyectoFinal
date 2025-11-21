# from django.contrib import admin
# from .models import Proveedor, Compra, Detalle_Compra

# @admin.register(Proveedor)
# class ProveedorAdmin(admin.ModelAdmin):
#     list_display = ('proveedor_nombre', 'proveedor_dni', 'proveedor_telefono', 'proveedor_email')
#     search_fields = ('proveedor_nombre', 'proveedor_dni')
#     list_per_page = 20

# class DetalleCompraInline(admin.TabularInline):
#     model = Detalle_Compra
#     extra = 1  # Número de formularios extra para agregar detalles
#     autocomplete_fields = ('insumo',)

# @admin.register(Compra)
# class CompraAdmin(admin.ModelAdmin):
#     list_display = (
#         'id',
#         'proveedor',
#         'empleado',
#         'caja',
#         'compra_fecha_hora',
#         'compra_total',
#         'compra_metodo_pago'
#     )
#     inlines = [DetalleCompraInline]
#     readonly_fields = ('compra_fecha_hora', 'compra_total')
#     list_filter = ('compra_metodo_pago', 'empleado', 'proveedor')
#     search_fields = ('proveedor__proveedor_nombre', 'empleado__user__username', 'empleado__user__first_name')
#     autocomplete_fields = ('proveedor', 'empleado', 'caja')
#     date_hierarchy = 'compra_fecha_hora'
#     ordering = ('-compra_fecha_hora',)
