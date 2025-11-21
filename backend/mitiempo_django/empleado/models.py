from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

class Empleado(models.Model):
    """
    Perfil de empleado/usuario.
    Se crea automáticamente cuando:
      - se crea un User que ya pertenece a un grupo Empleado/Administrador, o
      - se le agrega el grupo Empleado/Administrador al User (m2m_changed).
    """
    ESPECIALIDADES = (
        ("peluquera", "Peluquera"),
        ("manicurista", "Manicurista"),
        ("maquilladora", "Maquilladora"),
        ("otro", "Otro"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='empleado')
    dni = models.CharField(max_length=100, unique=True, null=True, blank=True)
    telefono = models.CharField(max_length=100, blank=True)
    rol = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    especialidad = models.CharField(max_length=30, choices=ESPECIALIDADES, default="otro", blank=True)

    class Meta:
        verbose_name = "Empleado"
        verbose_name_plural = "Empleados"

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"


# ---------- Señales para crear perfil Empleado ----------
@receiver(post_save, sender=User)
def crear_perfil_empleado_post_save(sender, instance, created, **kwargs):
    """
    Si al crearse el User ya tiene grupo Empleado/Administrador, creamos perfil Empleado.
    """
    if created:
        if instance.groups.filter(name__in=["Empleado", "Administrador"]).exists():
            # Evitar duplicados si existiera por alguna razón
            Empleado.objects.get_or_create(user=instance, defaults={'rol': instance.groups.first()})

@receiver(m2m_changed, sender=User.groups.through)
def crear_perfil_empleado_m2m(sender, instance, action, pk_set, **kwargs):
    """
    Si se agrega el grupo Empleado/Administrador a un User ya existente -> crear perfil.
    action == 'post_add' es cuando se agregan grupos.
    """
    if action == 'post_add' and pk_set:
        grupos = Group.objects.filter(pk__in=pk_set, name__in=["Empleado", "Administrador"])
        if grupos.exists():
            # crear solo si no existe
            Empleado.objects.get_or_create(user=instance, defaults={'rol': grupos.first()})
