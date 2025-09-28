from rest_framework import viewsets
from mitiempo_enloderomi.models import Usuarios
from mitiempo_enloderomi.api.serializers import UsuariosSerializer
class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer