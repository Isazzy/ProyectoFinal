from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.db import transaction
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True, source='user.id')
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Cliente
        # Eliminamos 'rol' de los campos porque ya no existe en el modelo
        fields = [
            'id',
            'user_id',
            'user_email',
            'nombre',
            'apellido',
            'telefono',
            'email',
        ]
        extra_kwargs = {
            'apellido': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        if value and Cliente.objects.exclude(pk=self.instance.pk if self.instance else None)\
                                    .filter(email=value).exists():
            raise serializers.ValidationError("El email ya está asociado a otro cliente.")
        return value


class ClienteRegisterSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    apellido = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        nombre = validated_data["nombre"]
        apellido = validated_data.get("apellido", "")
        telefono = validated_data["telefono"]

        with transaction.atomic():
            # 1. Crear usuario
            user = User.objects.create_user(
                username=email, # Usamos email como username
                email=email,
                password=password,
                first_name=nombre,
                last_name=apellido
            )

            # 2. Asignar Grupo (Esto define el rol en Django)
            group, _ = Group.objects.get_or_create(name="Cliente")
            user.groups.add(group) 
            # Al hacer .add(group), la SEÑAL 'm2m_changed' en models.py se dispara 
            # y crea el Cliente automáticamente.

            # 3. Actualizar datos extra (teléfono)
            # Recuperamos el cliente creado por la señal y actualizamos el teléfono
            cliente, created = Cliente.objects.update_or_create(
                user=user,
                defaults={
                    'nombre': nombre,
                    'apellido': apellido,
                    'email': email,
                    'telefono': telefono, 
                    # 'rol': group  <--- ESTO ERA EL ERROR. SE ELIMINA.
                }
            )

            return cliente