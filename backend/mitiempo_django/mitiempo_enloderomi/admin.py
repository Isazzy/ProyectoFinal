# mitiempo_enloderomi/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Profile # Asegúrate de importar los modelos

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # 💡 AÑADIDO: Mostrar rol_profesional en la lista de usuarios
    list_display = ('email', 'username', 'role', 'rol_profesional', 'is_staff', 'is_active') 
    list_filter = ('role', 'rol_profesional', 'is_staff') # Opcional: añadir filtro
    
    # 💡 AÑADIDO: Incluir rol_profesional en el formulario de edición
    fieldsets = (
        # (Sección principal, Campos)
        (None, {'fields': ('email', 'username', 'password', 'role', 'rol_profesional', 'dias_laborables')}), 
        # (Sección Permisos, Campos)
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        # (Sección Info Personal, Campos - opcional si los quieres aquí)
        ('Personal info', {'fields': ('first_name', 'last_name')}), 
         # (Sección Fechas Importantes - opcional)
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Asegúrate que add_fieldsets también lo incluya si quieres definirlo al crear
    add_fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password', 'role', 'rol_profesional', 'dias_laborables', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

    # Necesario para que fieldsets funcione correctamente con UserAdmin
    filter_horizontal = ('groups', 'user_permissions',) 

# Registrar los modelos con sus clases de Admin personalizadas
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Profile) # Asume que Profile no necesita personalización compleja