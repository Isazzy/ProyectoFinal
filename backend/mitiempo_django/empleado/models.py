from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

class Empleado(models.Model):
    ESPECIALIDADES = (
        ("peluquera", "Peluquera"),
        ("manicurista", "Manicurista"),
        ("maquilladora", "Maquilladora"),
        ("otro", "Otro"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='empleado')
    dni = models.CharField(max_length=100, unique=True, null=True, blank=True)
    telefono = models.CharField(max_length=100, blank=True)

    # Rol viene del group
    rol = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    especialidad = models.CharField(max_length=30, choices=ESPECIALIDADES, default="otro", blank=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"


# ---------- Señales ----------
@receiver(post_save, sender=User)
def crear_empleado_post_save(sender, instance, created, **kwargs):
    if created and instance.groups.filter(name__in=["Empleado", "Administrador"]).exists():
        Empleado.objects.get_or_create(
            user=instance,
            defaults={'rol': instance.groups.first()}
        )


@receiver(m2m_changed, sender=User.groups.through)
def crear_empleado_m2m(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add':
        grupos = Group.objects.filter(pk__in=pk_set, name__in=["Empleado", "Administrador"])
        if grupos.exists():
            Empleado.objects.get_or_create(
                user=instance,
                defaults={'rol': grupos.first()}
            )
