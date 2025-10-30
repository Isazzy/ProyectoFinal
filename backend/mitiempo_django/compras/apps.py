from django.apps import AppConfig


<<<<<<< HEAD
<<<<<<<< HEAD:backend/mitiempo_django/compras/apps.py
class ComprasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'compras'
========
class CajasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cajas'
>>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra):backend/mitiempo_django/cajas/apps.py
=======
class ComprasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'compras'

    def ready(self):
        import compras.signals  # Nueva línea: Conecta signals
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
