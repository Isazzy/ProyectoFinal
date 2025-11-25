from django.contrib import admin
<<<<<<< HEAD
# Importamos solo el modelo que estamos usando
from .models import Servicio

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = (
        "nombre_serv", 
        "tipo_serv", 
        "precio_serv", 
        "duracion_minutos", # Campo actualizado
        "dias_disponibles", # Campo nuevo
        "activado"
    )
    list_filter = ("tipo_serv", "activado") # 'rol_requerido' eliminado
    search_fields = ("nombre_serv", "tipo_serv")
    
    # Actualizado a 'duracion_minutos'
    list_editable = ("precio_serv", "duracion_minutos", "activado")

# 
# El 'ServicioProfesionalAdmin' se elimina 
# porque el modelo 'ServicioProfesional' ya no existe en esta lógica.
#
=======
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
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
