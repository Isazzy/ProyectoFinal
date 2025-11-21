from django.contrib import admin
from .models import Caja

@admin.register(Caja)
class CajaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'empleado',
        'caja_estado',
        'caja_monto_inicial',
        'caja_saldo_final',
        'caja_fecha_hora_apertura',
        'caja_fecha_hora_cierre'
    )
    list_filter = ('caja_estado', 'caja_fecha_hora_apertura')
    search_fields = (
        'empleado__user__first_name',
        'empleado__user__last_name',
        'empleado__user__username',
        'empleado__rol__name'
    )
    readonly_fields = ('caja_fecha_hora_apertura', 'caja_fecha_hora_cierre', 'caja_saldo_final')
    ordering = ('-caja_fecha_hora_apertura',)
    list_per_page = 20

    fieldsets = (
        ('Información de Apertura', {
            'fields': ('empleado', 'caja_monto_inicial', 'caja_observacion', 'caja_fecha_hora_apertura')
        }),
        ('Estado y Cierre', {
            'fields': ('caja_estado', 'caja_saldo_final', 'caja_fecha_hora_cierre')
        }),
    )
