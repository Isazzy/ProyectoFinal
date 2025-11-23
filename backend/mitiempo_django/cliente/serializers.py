from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True, source='user.id')
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Cliente
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

        # 1. Crear usuario
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=nombre,
            last_name=apellido
        )

        # 2. Asignar Grupo
        group, _ = Group.objects.get_or_create(name="Cliente")
        
        # ¡IMPORTANTE! Al ejecutar la siguiente línea, se dispara la señal 'm2m_changed'
        # y se crea el Cliente automáticamente en la base de datos.
        user.groups.add(group) 

        # 3. Obtener y actualizar el Cliente existente (creado por la señal)
        # Usamos update_or_create para estar seguros y actualizar el teléfono que la señal no tenía.
        cliente, created = Cliente.objects.update_or_create(
            user=user,
            defaults={
                'nombre': nombre,
                'apellido': apellido,
                'telefono': telefono,
                'email': email,
                'rol': group
            }
        )

        return cliente