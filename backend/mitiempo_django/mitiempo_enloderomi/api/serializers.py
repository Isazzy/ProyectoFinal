from rest_framework import serializers
from mitiempo_enloderomi.models import Usuarios

class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = "__all__"
