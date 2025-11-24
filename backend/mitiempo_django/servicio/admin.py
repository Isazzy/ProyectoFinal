from django.contrib import admin
from .models import Servicio, ServicioInsumo

# Inline para agregar insumos directamente al crear/editar un Servicio
class ServicioInsumoInline(admin.TabularInline):
    model = ServicioInsumo
    extra = 1
    # Para que esto funcione, InsumoAdmin (en inventario) debe tener search_fields
    autocomplete_fields = ("insumo",) 
    verbose_name = "Insumo requerido"
    verbose_name_plural = "Receta del Servicio"

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("id_serv", "nombre", "tipo_serv", "precio", "duracion", "activo")
    list_filter = ("tipo_serv", "activo")
    search_fields = ("nombre", "tipo_serv") # Necesario para el autocomplete en ServicioInsumoAdmin
    ordering = ("nombre",)
    list_editable = ("activo",)
    inlines = [ServicioInsumoInline]

@admin.register(ServicioInsumo)
class ServicioInsumoAdmin(admin.ModelAdmin):
    list_display = ("id", "servicio", "insumo", "cantidad") # Corregido: en tu modelo se llama 'cantidad', no 'cantidad_usada'
    # autocomplete_fields requiere que ServicioAdmin e InsumoAdmin tengan search_fields
    autocomplete_fields = ("servicio", "insumo")