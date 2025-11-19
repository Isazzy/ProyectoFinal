from django.contrib import admin
from .models import Ventas, DetVentas

@admin.register(Ventas)
class VentasAdmin(admin.ModelAdmin):
    list_display = ('id_venta', 'cliente', 'total_venta', 'tipo_venta', 'tipo_pago', 'fech_hs_vent')
    list_filter = ('tipo_venta', 'tipo_pago', 'fech_hs_vent')
    search_fields = ('cliente__username', 'id_venta')

@admin.register(DetVentas)
class DetVentasAdmin(admin.ModelAdmin):
    list_display = ('id_det_venta', 'id_venta', 'id_prod', 'id_serv', 'cantidad_venta', 'precio_unitario', 'subtotal')
    list_filter = ('id_venta',)
    search_fields = ('id_prod__nombre_prod', 'id_serv__nombre_serv')