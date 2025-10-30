# /backend/mitiempo_django/mitiempo_enloderomi/api/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from mitiempo_enloderomi.models import Profile


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    (Tu RegisterSerializer - Sin cambios, está perfecto)
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'cliente')
        )
        Profile.objects.create(user=user)
        return user


# --- SERIALIZER DE LOGIN (CORREGIDO) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        """
        Sobrescribimos este método para AÑADIR DATOS al payload del token.
        """
        token = super().get_token(user)

        # --- ¡AQUÍ ESTÁ LA MAGIA! ---
        # Añade campos personalizados al "payload" (la parte decodificable).
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        # ... puedes añadir más campos aquí si los necesitas en React

        return token

    def validate(self, attrs):
        """
        Sobrescribimos validate para que use 'email' (ya que tu
        USERNAME_FIELD es 'email') y para añadir los datos del 
        usuario a la *respuesta* JSON (además de al token).
        """
        
        # 'super().validate()' ya usará 'email' y 'password'
        # porque tu modelo tiene USERNAME_FIELD = 'email'
        data = super().validate(attrs) 

        # Añadimos los datos del usuario a la respuesta JSON principal
        # (Esto es opcional, pero bueno para depurar)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'role': self.user.role,
        }

        return data


class UserCRUDSerializer(serializers.ModelSerializer):
    """
    (Tu UserCRUDSerializer - Sin cambios, está perfecto)
    """
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'password', 'role', 'rol_profesional', 'dias_laborables'
        ]
        
    # ... (tus métodos create y update están bien)
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance