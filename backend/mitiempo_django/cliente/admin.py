from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "apellido", "telefono", "email", "user")
    search_fields = ("nombre", "apellido", "email", "telefono", "user__email", "user__username")
    list_filter = ("apellido", )
    ordering = ("nombre",)
    list_per_page = 25
    autocomplete_fields = ("user",)
