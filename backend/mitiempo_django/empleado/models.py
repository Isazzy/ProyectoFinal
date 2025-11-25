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
    
    # Rol es informativo, el permiso real lo da user.groups
    rol = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    especialidad = models.CharField(max_length=30, choices=ESPECIALIDADES, default="otro", blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.rol.name if self.rol else 'Sin Rol'})"

# Señal para crear Empleado automáticamente al asignar grupo
@receiver(m2m_changed, sender=User.groups.through)
def gestionar_perfil_empleado(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add':
        # Buscamos si se agregaron grupos de staff
        grupos_staff = Group.objects.filter(pk__in=pk_set, name__in=["Empleado", "Administrador"])
        
        if grupos_staff.exists():
            grupo_asignado = grupos_staff.first()
            
            # Crear o actualizar perfil de empleado
            Empleado.objects.update_or_create(
                user=instance,
                defaults={'rol': grupo_asignado}
            )
            
            # Si es Admin, dar permisos de staff
            if grupo_asignado.name == "Administrador":
                instance.is_staff = True
                instance.save()