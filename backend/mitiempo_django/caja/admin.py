<<<<<<< HEAD
# caja/admin.py

=======
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
from django.contrib import admin
from .models import Caja

@admin.register(Caja)
class CajaAdmin(admin.ModelAdmin):
<<<<<<< HEAD
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
=======
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
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
