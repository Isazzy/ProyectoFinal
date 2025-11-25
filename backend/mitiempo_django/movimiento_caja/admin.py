from django.contrib import admin
from .models import Egreso, Ingreso

@admin.register(Egreso)
class EgresoAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para Egresos.
    """
    list_display = ('id', 'caja', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha', 'egreso_hora')
    list_filter = ('caja', 'egreso_fecha') # Quitamos la hora del filtro lateral si es muy granular
    search_fields = ('egreso_descripcion',)
    
    # CORRECCIÓN: date_hierarchy debe ser un string único
    date_hierarchy = 'egreso_fecha' 
    
    list_per_page = 25
    
    readonly_fields = ('caja', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha', 'egreso_hora')

    def has_add_permission(self, request):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(Ingreso)
class IngresoAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para Ingresos.
    """
    list_display = ('id', 'caja', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha', 'ingreso_hora')
    list_filter = ('caja', 'ingreso_fecha')
    search_fields = ('ingreso_descripcion',)
    
    # CORRECCIÓN: date_hierarchy debe ser un string único
    date_hierarchy = 'ingreso_fecha'
    
    list_per_page = 25
    
    readonly_fields = ('caja', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha', 'ingreso_hora')

    def has_add_permission(self, request):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False