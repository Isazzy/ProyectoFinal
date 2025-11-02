from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.auth import get_user_model


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('empleado', 'Empleado'),
        ('cliente', 'Cliente'),
    ]

    PROFESION_CHOICES = [
        ('peluquera', 'Peluquera'),
        ('manicurista', 'Manicurista'),
        ('estilista', 'Estilista'),
        ('multi', 'Múltiple'),
        (None, 'Sin asignar'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='cliente')
    rol_profesional = models.CharField(max_length=20, choices=PROFESION_CHOICES, blank=True, null=True)
    dias_laborables = models.JSONField(default=list, blank=True)  # Ejemplo: ["Lunes", "Martes"]

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        if self.role == 'empleado':
            return f"{self.username} ({self.rol_profesional})"
        return f"{self.username} ({self.role})"
    
    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_staff = True
        super().save(*args, **kwargs)


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.email}"


User = get_user_model()










