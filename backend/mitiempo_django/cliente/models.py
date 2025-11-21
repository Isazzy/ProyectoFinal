from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

class Cliente(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="cliente"
    )

    cliente_nombre = models.CharField(max_length=200)
    cliente_apellido = models.CharField(max_length=200, null=True, blank=True)
    cliente_telefono = models.CharField(max_length=200, blank=True)
    cliente_direccion = models.CharField(max_length=200, blank=True)
    cliente_email = models.EmailField(max_length=200, null=True, blank=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):
        nombre = self.cliente_nombre or (self.user.first_name if self.user else '')
        apellido = self.cliente_apellido or (self.user.last_name if self.user else '')
        return f"{nombre} {apellido}".strip()


# ---------- Señales para crear perfil Cliente ----------
@receiver(post_save, sender=User)
def crear_perfil_cliente_post_save(sender, instance, created, **kwargs):
    """
    Si al crearse el User ya pertenece al grupo 'Cliente', creamos perfil Cliente.
    """
    if created:
        if instance.groups.filter(name__iexact="Cliente").exists():
            Cliente.objects.get_or_create(
                user=instance,
                defaults={
                    'cliente_nombre': instance.first_name or '',
                    'cliente_apellido': instance.last_name or '',
                    'cliente_email': instance.email or ''
                }
            )

@receiver(m2m_changed, sender=User.groups.through)
def crear_perfil_cliente_m2m(sender, instance, action, pk_set, **kwargs):
    """
    Si se agrega el grupo Cliente a un User ya existente -> crear perfil.
    """
    if action == 'post_add' and pk_set:
        from django.contrib.auth.models import Group
        grupos = Group.objects.filter(pk__in=pk_set, name__iexact="Cliente")
        if grupos.exists():
            Cliente.objects.get_or_create(
                user=instance,
                defaults={
                    'cliente_nombre': instance.first_name or '',
                    'cliente_apellido': instance.last_name or '',
                    'cliente_email': instance.email or ''
                }
            )
