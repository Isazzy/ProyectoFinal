# turnos/admin.py
from django.contrib import admin
from .models import Turno, TurnoServicio

class TurnoServicioInline(admin.TabularInline):
    """
    Permite agregar/editar/eliminar servicios directamente 
    dentro de la vista de un Turno.
    """
    model = TurnoServicio
    extra = 1  # Muestra 1 slot vacío para agregar un nuevo servicio
    autocomplete_fields = ("servicio",) # Facilita buscar servicios

@admin.register(Turno)
class TurnoAdmin(admin.ModelAdmin):
    list_display = (
        "id_turno", 
        "cliente", 
        "profesional", 
        "fecha_hora_inicio", 
        "fecha_hora_fin", 
        "estado_turno"
    )
    list_filter = ("estado_turno", "profesional", "fecha_hora_inicio")
    search_fields = ("cliente__username", "profesional__username", "cliente__email")
    ordering = ("-fecha_hora_inicio",)
    
    # Hacemos los campos de fecha y fin solo de lectura, 
    # ya que deben calcularse por el serializer (o manualmente si se crea desde admin)
    readonly_fields = ("fecha_hora_fin",) 

    fieldsets = (
        ("Información Principal", {
            "fields": ("cliente", "profesional", "estado_turno", "observaciones")
        }),
        ("Fecha y Hora", {
            "fields": ("fecha_hora_inicio", "fecha_hora_fin")
        }),
    )
    
    # ¡Aquí agregamos el inline!
    inlines = [TurnoServicioInline]
    
    autocomplete_fields = ("cliente", "profesional")

# Nota: No registramos 'TurnoServicio' por separado, 
# ya que se maneja mucho mejor a través del Inline en 'TurnoAdmin'.