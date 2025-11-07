from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from mitiempo_enloderomi.models import Profile

User = get_user_model()


# 🔹 1. Registro público (usuarios web)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'telefono', 'password')

    def create(self, validated_data):
        # Crear usuario con contraseña encriptada
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono', '')
        )

        # ✅ Asignar grupo "Cliente" automáticamente
        cliente_group, _ = Group.objects.get_or_create(name="Cliente")
        user.groups.add(cliente_group)

        # ✅ Crear perfil asociado si no existe
        Profile.objects.get_or_create(user=user)

        return user


# 🔹 2. Token personalizado (JWT)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Agrega datos personalizados al token JWT
    e incluye grupos/roles para el frontend.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        groups = [g.name for g in user.groups.all()]
        token['groups'] = groups
        token['role'] = groups[0].lower() if groups else 'cliente'
        token['username'] = user.username
        token['email'] = user.email
        token['telefono'] = user.telefono
        return token

    def validate(self, attrs):
        """
        Devuelve datos extra al autenticarse.
        """
        data = super().validate(attrs)
        groups = [g.name for g in self.user.groups.all()]
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'telefono': self.user.telefono,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'groups': groups,
            'role': groups[0].lower() if groups else 'cliente',
        }
        # Incluimos el rol principal directamente por conveniencia
        data['role'] = data['user']['role']
        return data


# 🔹 3. CRUD para panel de administración
class UserCRUDSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    groups = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Group.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'telefono', 'password', 'groups'
        ]

    def create(self, validated_data):
        groups_data = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_password(User.objects.make_random_password())

        user.save()

        # Si no se especifican grupos, asignar "Cliente"
        if not groups_data:
            cliente_group, _ = Group.objects.get_or_create(name="Cliente")
            groups_data = [cliente_group]

        user.groups.set(groups_data)

        # Crear perfil si no existe
        Profile.objects.get_or_create(user=user)

        return user

    def update(self, instance, validated_data):
        groups_data = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if groups_data is not None:
            instance.groups.set(groups_data)

        return instance
