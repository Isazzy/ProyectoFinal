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

    def destroy(self, request, *args, **kwargs):
        cliente = self.get_object()
        
        # 1. VERIFICACIÓN DE TURNOS (Regla de Negocio)
        # El turno apunta al User, así que verificamos a través del user asociado.
        if cliente.user and cliente.user.turnos_como_cliente.exists():
            return Response(
                {"detail": f"No se puede eliminar a {cliente.nombre}: Tiene turnos registrados en el historial."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. VERIFICACIÓN DE VENTAS (Integridad de Base de Datos)
        # Esto atrapa el error si la BD tiene restricciones (PROTECT)
        try:
            # Intentamos borrar.
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar: El cliente tiene ventas/compras registradas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": "Error al eliminar el cliente. Verifique dependencias."},
                status=status.HTTP_400_BAD_REQUEST
            )



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

