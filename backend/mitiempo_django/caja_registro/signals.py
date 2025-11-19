# caja_registro/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from venta.models import Ventas  # Modelo de ventas
from compra.models import Compra  # Modelo de compras
from servicio.models import Servicio  # Modelo de servicios (si aplican)
from caja.models import Caja
from .models import MovimientoCaja

@receiver(post_save, sender=Ventas)
def registrar_ingreso_venta(sender, instance, created, **kwargs):
    if created:  # Solo al crear nueva venta
        try:
            caja_abierta = Caja.objects.get(caja_estado=True, usuario=instance.cliente)  # Asume caja por cliente; ajusta si es por empleado
            MovimientoCaja.objects.create(
                caja=caja_abierta,
                tipo_movimiento='INGRESO',
                monto=instance.total_venta,
                usuario=instance.cliente,  # O el empleado que registró
                motivo=f'Venta #{instance.id_venta}',
                venta=instance
            )
        except Caja.DoesNotExist:
            pass  # No registrar si no hay caja abierta

@receiver(post_save, sender=Compra)
def registrar_egreso_compra(sender, instance, created, **kwargs):
    if created:  # Solo al crear nueva compra
        try:
            caja_abierta = Caja.objects.get(caja_estado=True, usuario=instance.ro_usuario)  # Asume caja por usuario
            MovimientoCaja.objects.create(
                caja=caja_abierta,
                tipo_movimiento='EGRESO',
                monto=instance.total_compra,
                usuario=instance.ro_usuario,
                motivo=f'Compra #{instance.id_compra}',
                compra=instance
            )
        except Caja.DoesNotExist:
            pass

# Si servicios son vendidos independientemente, agrega un signal similar
# @receiver(post_save, sender=Servicio)
# def registrar_ingreso_servicio(sender, instance, created, **kwargs):
#     # Lógica similar para servicios