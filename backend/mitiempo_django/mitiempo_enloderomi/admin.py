# mitiempo_enloderomi/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from .models import CustomUser, Profile

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'first_name', 'last_name', 'telefono', 'is_staff', 'is_active', 'get_groups')
    list_filter = ('is_staff', 'is_active', 'groups')

    fieldsets = (
        ('Datos de acceso', {'fields': ('email', 'username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'telefono')}),
        ('Permisos', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'first_name', 'last_name', 'telefono', 'is_staff', 'is_active', 'groups'),
        }),
    )

    search_fields = ('email', 'username', 'first_name', 'last_name', 'telefono')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

    def get_groups(self, obj):
        """Muestra los grupos a los que pertenece el usuario en una sola columna."""
        return ", ".join([g.name for g in obj.groups.all()])
    get_groups.short_description = 'Grupos'


# Si tienes modelo Profile
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__email', 'user__username')
