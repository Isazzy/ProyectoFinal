from django.contrib import admin
from .models import Turnos, Servicios, TurnosXServicios

@admin.register(Turnos)
class TurnoAdmin(admin.ModelAdmin):
    list_display = ("id_turno", "id_cli", "id_prof", "fecha_turno", "hora_turno", "estado_turno")
    list_filter = ("fecha_turno", "estado_turno", "id_prof")
    search_fields = ("id_cli__username", "id_prof__username")
    ordering = ("-fecha_turno", "-hora_turno")

    fieldsets = (
        ("Información del turno", {
            "fields": ("id_cli", "id_prof", "fecha_turno", "hora_turno", "estado_turno", "observaciones")
        }),
    )

@admin.register(Servicios)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("nombre_serv", "tipo_serv", "precio_serv", "duracion_serv", "activado")
    list_filter = ("tipo_serv", "activado")

@admin.register(TurnosXServicios)
class TurnosXServiciosAdmin(admin.ModelAdmin):
    list_display = ("id_turno", "id_serv")
