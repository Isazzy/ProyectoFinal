from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Cliente
from .serializers import ClienteSerializer, ClienteRegisterSerializer


# Lista / creación (crear Clientes desde UI administrativa lo dejamos por admin)
class ClienteListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nombre', 'apellido')
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Permitimos listar a usuarios autenticados.
        # Crear por API lo dejamos sólo a admins para evitar duplicados manuales.
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

# Detalle (GET/PATCH/DELETE) — autenticado
class ClienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]

# Registro público (frontend) -> crea User + Cliente, permite anonymous




from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import ClienteRegisterSerializer, ClienteSerializer

class ClienteRegisterView(generics.CreateAPIView):
    serializer_class = ClienteRegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cliente = serializer.save()
        return Response(ClienteSerializer(cliente).data, status=status.HTTP_201_CREATED)

