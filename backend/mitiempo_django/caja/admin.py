# caja/admin.py

from django.contrib import admin
from .models import Caja

@admin.register(Caja)
class CajaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'caja_estado', 'caja_monto_inicial', 'caja_saldo_final', 'caja_fecha_hora_apertura', 'caja_fecha_hora_cierre')
    list_filter = ('caja_estado', 'caja_fecha_hora_apertura', 'usuario')
    search_fields = ('usuario__email', 'id')  # Ajustado para custom user (usa 'email' en lugar de 'username')
    readonly_fields = ('caja_fecha_hora_apertura', 'caja_fecha_hora_cierre')
    actions = ['cerrar_cajas']

    def cerrar_cajas(self, request, queryset):
        """Acción para cerrar múltiples cajas seleccionadas."""
        for caja in queryset:
            if caja.caja_estado:
                caja.cerrar_caja()
        self.message_user(request, f"{queryset.count()} caja(s) cerrada(s).")
    cerrar_cajas.short_description = "Cerrar cajas seleccionadas"