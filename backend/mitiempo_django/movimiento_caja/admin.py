from django.contrib import admin
from .models import Egreso, Ingreso

@admin.register(Egreso)
class EgresoAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para Egresos.
    """
    list_display = ('id', 'caja', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha_hora')
    list_filter = ('caja', 'egreso_fecha_hora')
    search_fields = ('egreso_descripcion',)
    date_hierarchy = 'egreso_fecha_hora'
    list_per_page = 25
    
    # Hacemos que los campos sean de solo lectura en el admin,
    # ya que deberían crearse desde la app y no manualmente.
    readonly_fields = ('caja', 'egreso_descripcion', 'egreso_monto', 'egreso_fecha_hora')

    def has_add_permission(self, request):
        # Deshabilita el botón "Añadir Egreso" en el admin
        return False
        
    def has_change_permission(self, request, obj=None):
        # Deshabilita la edición (pero permite ver)
        return False

@admin.register(Ingreso)
class IngresoAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para Ingresos.
    """
    list_display = ('id', 'caja', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha_hora')
    list_filter = ('caja', 'ingreso_fecha_hora')
    search_fields = ('ingreso_descripcion',)
    date_hierarchy = 'ingreso_fecha_hora'
    list_per_page = 25
    
    # Solo lectura
    readonly_fields = ('caja', 'ingreso_descripcion', 'ingreso_monto', 'ingreso_fecha_hora')

    def has_add_permission(self, request):
        # Deshabilita el botón "Añadir Ingreso" en el admin
        return False
        
    def has_change_permission(self, request, obj=None):
        # Deshabilita la edición
        return False

# Nota: Si prefieres poder crearlos y editarlos manualmente desde el admin,
# simplemente borra las clases EgresoAdmin e IngresoAdmin
# y descomenta las siguientes dos líneas:
#
# admin.site.register(Egreso)
# admin.site.register(Ingreso)