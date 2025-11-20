from django.contrib import admin

# servicios/admin.py
from django.contrib import admin
from .models import Servicio, ServicioProfesional

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = (
        "nombre_serv", 
        "tipo_serv", 
        "precio_serv", 
        "duracion_serv", 
        "rol_requerido", 
        "activado"
    )
    list_filter = ("tipo_serv", "activado", "rol_requerido")
    search_fields = ("nombre_serv", "tipo_serv")
    list_editable = ("precio_serv", "duracion_serv", "activado")

@admin.register(ServicioProfesional)
class ServicioProfesionalAdmin(admin.ModelAdmin):
    """
    Panel para asignar Servicios a Profesionales.
    """
    list_display = ("profesional", "servicio", "rol")
    list_filter = ("profesional", "servicio__tipo_serv")
    search_fields = ("profesional__username", "servicio__nombre_serv")
    autocomplete_fields = ("profesional", "servicio") # Facilita la búsqueda

    def get_queryset(self, request):
        # Optimiza la consulta
        return super().get_queryset(request).select_related('profesional', 'servicio')
