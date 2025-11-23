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

    nombre = models.CharField(max_length=200)
    apellido = models.CharField(max_length=200, null=True, blank=True)
    telefono = models.CharField(max_length=200, blank=True)
    email = models.EmailField(max_length=200, null=True, blank=True)
    rol = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ("nombre", "apellido")

    def __str__(self):
        return f"{self.nombre} {self.apellido}".strip()


# ---------- Señales ----------
@receiver(post_save, sender=User)
def crear_perfil_cliente_post_save(sender, instance, created, **kwargs):
    # Nota: Al crear un usuario con create_user, usualmente aún no tiene grupos.
    # Esta señal sirve si se crean usuarios y grupos en una sola transacción o via Admin.
    if created:
        if instance.groups.filter(name__iexact="Cliente").exists():
            Cliente.objects.get_or_create(
                user=instance,
                defaults={
                    'nombre': instance.first_name or '',
                    'apellido': instance.last_name or '',
                    'email': instance.email or ''
                }
            )

@receiver(m2m_changed, sender=User.groups.through)
def crear_perfil_cliente_m2m(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add':
        # Verificamos si se agregó el grupo Cliente
        if Group.objects.filter(pk__in=pk_set, name__iexact="Cliente").exists():
            Cliente.objects.get_or_create(
                user=instance,
                defaults={
                    'nombre': instance.first_name or '',
                    'apellido': instance.last_name or '',
                    'email': instance.email or ''
                }
            )