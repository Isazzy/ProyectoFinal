# servicio/admin.py
from django.contrib import admin
from .models import Servicio, ServicioInsumo


class ServicioInsumoInline(admin.TabularInline):
    model = ServicioInsumo
    extra = 1
    autocomplete_fields = ("insumo",)


@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = (
        "id_serv", "nombre_serv", "tipo_serv",
        "precio_serv", "duracion_minutos",
        "activado"
    )
    list_filter = ("tipo_serv", "activado")
    search_fields = ("nombre_serv", "tipo_serv")
    ordering = ("nombre_serv",)
    list_editable = ("activado",)
    inlines = [ServicioInsumoInline]


@admin.register(ServicioInsumo)
class ServicioInsumoAdmin(admin.ModelAdmin):
    list_display = ("id", "servicio", "insumo", "cantidad_usada")
    autocomplete_fields = ("servicio", "insumo")
