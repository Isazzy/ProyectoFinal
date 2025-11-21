# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Cliente

@receiver(post_save, sender=User)
def crear_cliente_automaticamente(sender, instance, created, **kwargs):
    if created:
        Cliente.objects.create(
            user=instance,
           cliente_nombre=instance.first_name,
            cliente_apellido=instance.last_name,
            cliente_email=instance.email,
            cliente_telefono=instance.profile.telefono if hasattr(instance, 'profile') else ''
        )

