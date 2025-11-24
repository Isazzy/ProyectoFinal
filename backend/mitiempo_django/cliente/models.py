from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

class Cliente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente")
    nombre = models.CharField(max_length=200)
    apellido = models.CharField(max_length=200, null=True, blank=True)
    telefono = models.CharField(max_length=200, blank=True)
    email = models.EmailField(max_length=200, null=True, blank=True)
    # Eliminamos 'rol' aquí, el rol lo define el Grupo de Django, no es necesario duplicarlo en el modelo.

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ("nombre", "apellido")

    def __str__(self):
        return f"{self.nombre} {self.apellido}".strip()

# ---------- Señales ----------

@receiver(m2m_changed, sender=User.groups.through)
def gestionar_perfil_cliente(sender, instance, action, pk_set, **kwargs):
    """
    Si se agrega el grupo 'Cliente', se crea el perfil.
    Si se quita el grupo 'Cliente', NO borramos el perfil (para mantener historial de ventas).
    """
    if action == 'post_add':
        # Obtenemos los nombres de los grupos agregados
        grupos = Group.objects.filter(pk__in=pk_set).values_list('name', flat=True)
        
        if "Cliente" in grupos:
            Cliente.objects.get_or_create(
                user=instance,
                defaults={
                    'nombre': instance.first_name or instance.username,
                    'apellido': instance.last_name or '',
                    'email': instance.email or ''
                }
            )