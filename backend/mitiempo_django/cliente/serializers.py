from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True, source='user.id')
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'id',
            'user_id',
            'user_email',
            'cliente_nombre',
            'cliente_apellido',
            'cliente_telefono',
            'cliente_direccion',
            'cliente_email',
        ]
        extra_kwargs = {
            'cliente_apellido': {'required': False, 'allow_blank': True},
            'cliente_email': {'required': False, 'allow_blank': True},
        }

    def validate_cliente_email(self, value):
        if value and Cliente.objects.exclude(pk=self.instance.pk if self.instance else None)\
                                      .filter(cliente_email=value).exists():
            raise serializers.ValidationError("El email ya está asociado a otro cliente.")
        return value


class ClienteRegisterSerializer(serializers.Serializer):
    """
    Serializer para registro público de clientes.
    Crea User (con email y password), lo asigna al grupo 'Cliente' y crea perfil Cliente.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    cliente_telefono = serializers.CharField(required=False, allow_blank=True)
    cliente_direccion = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese email.")
        return value

    def create(self, validated_data):
        username = validated_data.get('username') or validated_data['email'].split('@')[0]
        # asegurar username único
        base = username
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{i}"
            i += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name',''),
            last_name=validated_data.get('last_name',''),
        )
        user.is_active = True
        user.save()

        grupo, _ = Group.objects.get_or_create(name="Cliente")
        user.groups.add(grupo)

        # Crear perfil cliente explícitamente (señal también lo haría, pero lo hacemos aquí con los datos)
        cliente = Cliente.objects.create(
            user=user,
            cliente_nombre=validated_data.get('first_name',''),
            cliente_apellido=validated_data.get('last_name',''),
            cliente_telefono=validated_data.get('cliente_telefono',''),
            cliente_direccion=validated_data.get('cliente_direccion',''),
            cliente_email=user.email
        )

        return cliente
