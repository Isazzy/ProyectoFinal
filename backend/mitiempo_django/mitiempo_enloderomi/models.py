from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.conf import settings

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email or self.username
    


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"



@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    if sender.name == 'mitiempo_enloderomi':
        for group_name in ["Administrador", "Empleado", "Cliente"]:
            Group.objects.get_or_create(name=group_name)
