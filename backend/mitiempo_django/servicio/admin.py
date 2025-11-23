# servicios/admin.py
from django.contrib import admin
from .models import Servicio, ServicioInsumo

class ServicioInsumoInline(admin.TabularInline):
    model = ServicioInsumo
    extra = 1
    autocomplete_fields = ("insumo",)

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("id_serv", "nombre", "tipo_serv", "precio", "duracion", "activo")
    list_filter = ("tipo_serv", "activo")
    search_fields = ("nombre", "tipo_serv")
    ordering = ("nombre",)
    list_editable = ("activo",)
    inlines = [ServicioInsumoInline]

@admin.register(ServicioInsumo)
class ServicioInsumoAdmin(admin.ModelAdmin):
    list_display = ("id", "servicio", "insumo", "cantidad_usada")
    autocomplete_fields = ("servicio", "insumo")
