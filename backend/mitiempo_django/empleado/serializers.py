from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Empleado

# --- Token serializer personalizado ---
class MyTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No existe un usuario con este email.")

        user_auth = authenticate(username=user.username, password=password)

        if not user_auth:
            raise serializers.ValidationError("Credenciales inválidas.")

        if not user_auth.is_active:
            raise serializers.ValidationError("Usuario desactivado.")

        refresh = RefreshToken.for_user(user_auth)

        # Detectar rol
        if hasattr(user_auth, "empleado"):
            role = user_auth.empleado.rol.name if user_auth.empleado.rol else "Empleado"
        elif hasattr(user_auth, "cliente"):
            role = "Cliente"
        else:
            role = "SinRol"

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user_auth.id,
                "email": user_auth.email,
                "first_name": user_auth.first_name,
                "last_name": user_auth.last_name,
                "role": role,
            }
        }

# --- Serializers para Empleado ---

class EmpleadoNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ("id", "dni", "telefono", "especialidad", "rol")

class EmpleadoUserSerializer(serializers.ModelSerializer):
    """
    Serializer principal para LISTAR empleados.
    Combina datos del User (nombre, email, activo) con datos del Empleado (dni, tel).
    """
    empleado = EmpleadoNestedSerializer(read_only=True)
    rol = serializers.SerializerMethodField()
    
    # CORRECCIÓN: Agregamos is_active para el frontend
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "is_active", "empleado", "rol")

    def get_rol(self, obj):
        return obj.groups.first().name if obj.groups.exists() else "Sin Rol"

class EmpleadoCreateByAdminSerializer(serializers.Serializer):
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
        email = validated_data.get('email', '')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.is_active = True
        user.groups.add(rol)

        if rol.name.lower() == "administrador":
            user.is_staff = True
        user.save()

        empleado, created = Empleado.objects.get_or_create(user=user, defaults={
            'dni': validated_data.get('dni') or None,
            'telefono': validated_data.get('telefono', ''),
            'especialidad': validated_data.get('especialidad', 'otro'),
            'rol': rol
        })
        # Si ya existía, actualizamos
        if not created:
            empleado.dni = validated_data.get('dni') or empleado.dni
            empleado.telefono = validated_data.get('telefono', empleado.telefono)
            empleado.especialidad = validated_data.get('especialidad', empleado.especialidad)
            empleado.rol = rol
            empleado.save()

        return empleado

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