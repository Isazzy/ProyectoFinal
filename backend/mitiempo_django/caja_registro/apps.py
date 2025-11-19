# caja_registro/apps.py

from django.apps import AppConfig

class CajaRegistroConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'caja_registro'

    def ready(self):
        import caja_registro.signals  # Conecta los signals al iniciar la app
