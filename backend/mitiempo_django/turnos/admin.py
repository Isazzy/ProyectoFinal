from django.contrib import admin
# Importamos los tres modelos de la app
from .models import Turno, TurnoServicio, ConfiguracionLocal
from django.utils.html import format_html
from django.urls import reverse

# --- Admin para el Modelo de Configuración ---

@admin.register(ConfiguracionLocal)
class ConfiguracionLocalAdmin(admin.ModelAdmin):
    """
    Admin para el modelo Singleton de Configuración.
    Solo permite editar la configuración existente, no crear nuevas.
    """
    list_display = ('__str__', 'hora_apertura', 'hora_cierre', 'tiempo_intervalo')

    def has_add_permission(self, request):
        # Deshabilita el botón "Añadir" si ya existe una instancia
        return not ConfiguracionLocal.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Deshabilita la acción de "Eliminar"
        return False

# --- Inline para la tabla intermedia ---

class TurnoServicioInline(admin.TabularInline):
    """
    Permite agregar/editar servicios directamente desde la vista del Turno.
    """
    model = TurnoServicio
    extra = 1 # Muestra un slot vacío para añadir un servicio
    
    # Asume que en 'servicio/admin.py' tienes 'search_fields'
    # configurado para el modelo 'Servicio'
    autocomplete_fields = ("servicio",) 
    
    # Muestra los campos de la tabla intermedia
    fields = ('servicio', 'duracion_servicio')
    
    # Hacemos que la duración sea de solo lectura si se autocompleta
    # desde el modelo Servicio (basado en el .save() que escribimos)
    readonly_fields = ('duracion_servicio',)

# --- Admin para el Modelo Principal de Turno ---

@admin.register(Turno)
class TurnoAdmin(admin.ModelAdmin):
    
    # --- Columnas a mostrar en la lista de turnos ---
    list_display = (
        "__str__",  # Muestra el resultado de str(turno)
        "fecha_hora_inicio", 
        "duracion_total_minutos", # Propiedad del modelo
        "fecha_hora_fin",       # Propiedad del modelo
        "estado",
         "cliente", "boton_crear_venta"
    )
    
    # --- Filtros disponibles en la barra lateral ---
    list_filter = ("estado", "fecha_hora_inicio")
    
    # --- Campos de búsqueda ---
    search_fields = ("cliente__username", "cliente__email", "cliente__first_name")
    
    # --- Orden por defecto ---
    ordering = ("-fecha_hora_inicio",)
    
    # --- Campos calculados (solo lectura) ---
    readonly_fields = ("duracion_total_minutos", "fecha_hora_fin") 

    # --- Organización de los campos en el formulario de edición ---
    fieldsets = (
        ("Información Principal", {
            "fields": ("cliente", "estado", "observaciones")
        }),
        ("Fecha y Hora", {
            "fields": ("fecha_hora_inicio", "duracion_total_minutos", "fecha_hora_fin")
        }),
    )
    def boton_crear_venta(self, obj):
        # Si el turno aún no está guardado, no mostrar el botón
        if not obj.pk:
            return "Guardar el turno primero"

        # Solo disponible si está completado
        if obj.estado != "completado":
            return "Solo disponible al completar"

        url = reverse("admin:ventas_venta_add") + f"?turno_id={obj.pk}"
        return format_html('<a class="button" href="{}">Crear Venta</a>', url)

    boton_crear_venta.short_description = "Generar Venta"

    
    # --- Añadimos el inline de servicios ---
    inlines = [TurnoServicioInline]
    
    # --- Búsqueda predictiva para el cliente ---
    autocomplete_fields = ("cliente",)



    