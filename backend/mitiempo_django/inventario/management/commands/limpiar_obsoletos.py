from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from inventario.models import Producto

class Command(BaseCommand):
    help = 'Elimina definitivamente productos inactivos con stock 0 y más de 2 años de antigüedad'

    def handle(self, *args, **kwargs):
        # Definir la fecha límite (hace 2 años/730 días)
        fecha_limite = timezone.now() - timedelta(days=730)

        # Filtrar productos que cumplen la regla
        productos_a_borrar = Producto.objects.filter(
            activo=False,
            stock=0,
            producto_fecha_actualizacion__lte=fecha_limite
        )

        cantidad = productos_a_borrar.count()

        if cantidad > 0:
            # Borrado físico definitivo
            productos_a_borrar.delete()
            self.stdout.write(self.style.SUCCESS(f'Se eliminaron {cantidad} productos obsoletos.'))
        else:
            self.stdout.write(self.style.WARNING('No hay productos que cumplan los criterios para ser eliminados.'))