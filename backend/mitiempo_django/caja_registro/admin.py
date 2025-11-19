from django.contrib import admin
from .models import MovimientoCaja

@admin.register(MovimientoCaja)
class MovimientoCajaAdmin(admin.ModelAdmin):
    list_display = ('id', 'caja', 'tipo_movimiento', 'monto', 'fecha_hora', 'usuario', 'motivo')
    list_filter = ('tipo_movimiento', 'fecha_hora', 'caja')
    search_fields = ('motivo', 'usuario__username')
    readonly_fields = ('fecha_hora',)