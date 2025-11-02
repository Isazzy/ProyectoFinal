<<<<<<< HEAD
<<<<<<< HEAD
# turnos/admin.py
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
from django.contrib import admin
# Importamos los tres modelos de la app
from .models import Turno, TurnoServicio, ConfiguracionLocal

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
        "estado"
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
    
    # --- Añadimos el inline de servicios ---
    inlines = [TurnoServicioInline]
    
<<<<<<< HEAD
    autocomplete_fields = ("cliente", "profesional")

# Nota: No registramos 'TurnoServicio' por separado, 
# ya que se maneja mucho mejor a través del Inline en 'TurnoAdmin'.
=======
from django.contrib import admin
# Importamos los tres modelos de la app
from .models import Turno, TurnoServicio, ConfiguracionLocal

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
        "estado"
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
    
    # --- Añadimos el inline de servicios ---
    inlines = [TurnoServicioInline]
    
    # --- Búsqueda predictiva para el cliente ---
    autocomplete_fields = ("cliente",)
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    # --- Búsqueda predictiva para el cliente ---
    autocomplete_fields = ("cliente",)
>>>>>>> 5f5a7856 (Actualizacion de models.py)
