from django.contrib import admin
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