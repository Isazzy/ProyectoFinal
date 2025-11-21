from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente_nombre", "cliente_apellido", "cliente_telefono", "cliente_email", "user")
    search_fields = ("cliente_nombre", "cliente_apellido", "cliente_email", "cliente_telefono", "user__username", "user__email")
    list_filter = ("cliente_apellido", )
    ordering = ("cliente_nombre",)
    list_per_page = 20
    autocomplete_fields = ("user",)
