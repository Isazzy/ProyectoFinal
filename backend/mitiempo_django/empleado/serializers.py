from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .models import Empleado

# --- Token serializer personalizado (login por email) ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # indica que la "clave" para buscar será el email

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise AuthenticationFailed("Debes ingresar email y contraseña.")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Email o contraseña incorrectos.")

        if not user.check_password(password):
            raise AuthenticationFailed("Email o contraseña incorrectos.")

        if not user.is_active:
            raise AuthenticationFailed("Tu cuenta no está activa.")

        # Genera token usando username internamente
        data = super().validate({
            "username": user.username,
            "password": password
        })

        rol = user.groups.first().name if user.groups.exists() else None

        data["user"] = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "rol": rol
        }

        return data


# --- Serializers para Empleado (lectura / update por admin) ---
class EmpleadoNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ("id", "dni", "telefono", "especialidad", "rol")


class EmpleadoCreateByAdminSerializer(serializers.Serializer):
    """
    Usado sólo por admin para crear empleado+user.
    """
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    dni = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    especialidad = serializers.ChoiceField(choices=Empleado.ESPECIALIDADES, required=False)
    rol = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())

    def create(self, validated_data):
        rol = validated_data.pop('rol')
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, email=validated_data.get('email'), password=password,
                                        first_name=validated_data.get('first_name',''),
                                        last_name=validated_data.get('last_name',''))
        user.is_active = True
        user.groups.add(rol)
        user.is_staff = (rol.name.lower() == "administrador")
        user.save()

        # Empleado perfil será creado por la señal m2m_changed / post_save, pero aseguramos campos:
        empleado = user.empleado
        empleado.dni = validated_data.get('dni', '') or None
        empleado.telefono = validated_data.get('telefono','')
        empleado.especialidad = validated_data.get('especialidad','otro')
        empleado.rol = rol
        empleado.save()
        return empleado


class EmpleadoUserSerializer(serializers.ModelSerializer):
    empleado = EmpleadoNestedSerializer(read_only=True)
    rol = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "empleado", "rol")

    def get_rol(self, obj):
        return obj.groups.first().name if obj.groups.exists() else None


class EmpleadoUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    rol = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Empleado
        fields = ("dni", "telefono", "especialidad", "rol", "first_name", "last_name", "email")

    def update(self, instance, validated_data):
        instance.dni = validated_data.get("dni", instance.dni)
        instance.telefono = validated_data.get("telefono", instance.telefono)
        instance.especialidad = validated_data.get("especialidad", instance.especialidad)
        new_rol = validated_data.get("rol", instance.rol)
        instance.rol = new_rol
        instance.save()

        user = instance.user
        user.first_name = validated_data.get("first_name", user.first_name)
        user.last_name = validated_data.get("last_name", user.last_name)
        user.email = validated_data.get("email", user.email)
        user.save()

        if new_rol:
            user.groups.set([new_rol])
            user.is_staff = (new_rol.name.lower() == "administrador")
        else:
            user.groups.clear()
            user.is_staff = False
        user.save()
        return instance

    

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name")