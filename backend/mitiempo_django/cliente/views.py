from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Cliente
from .serializers import ClienteSerializer, ClienteRegisterSerializer
from django.contrib.auth.models import User

# List / create (admin uses admin panel; this endpoint lists clientes)
class ClienteListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('cliente_nombre', 'cliente_apellido')
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Crear mediante esta vista lo dejamos solo para personal autenticado (opcional)
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

# Detail view
class ClienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]

# Registro público (frontend) -> crea User + Cliente
class ClienteRegisterView(generics.CreateAPIView):
    serializer_class = ClienteRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cliente = serializer.save()
        data = ClienteSerializer(cliente, context={'request': request}).data
        return Response(data, status=status.HTTP_201_CREATED)
