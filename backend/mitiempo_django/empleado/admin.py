from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Empleado

# Desregistramos el UserAdmin por defecto y lo extendemos para incluir perfil Empleado inline
try:
    admin.site.unregister(User)
except Exception:
    pass

class EmpleadoInline(admin.StackedInline):
    model = Empleado
    can_delete = False
    verbose_name_plural = 'Perfil de Empleado'
    fk_name = 'user'
    fields = ('dni', 'telefono', 'rol', 'especialidad')

class CustomUserAdmin(UserAdmin):
    inlines = (EmpleadoInline, )

    def get_rol(self, instance):
        if hasattr(instance, 'empleado') and instance.empleado.rol:
            return instance.empleado.rol.name
        return None
    get_rol.short_description = 'Rol'

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_rol')
    list_select_related = ('empleado__rol', )

admin.site.register(User, CustomUserAdmin)

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'dni')
    list_display = ('user', 'rol', 'dni', 'telefono', 'especialidad')
    autocomplete_fields = ('rol',)
