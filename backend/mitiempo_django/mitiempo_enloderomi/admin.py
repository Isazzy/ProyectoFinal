# mitiempo_enloderomi/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Profile 

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'role', 'rol_profesional', 'is_staff', 'is_active') 
    list_filter = ('role', 'rol_profesional', 'is_staff')
    
   
    fieldsets = (
    
        (None, {'fields': ('email', 'username', 'password', 'role', 'rol_profesional', 'dias_laborables')}), 
   
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
      
        ('Personal info', {'fields': ('first_name', 'last_name')}), 
     
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
 
    add_fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password', 'role', 'rol_profesional', 'dias_laborables', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

    
    filter_horizontal = ('groups', 'user_permissions',) 


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Profile) 