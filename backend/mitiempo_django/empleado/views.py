from django.contrib.auth.models import User, Group
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.db.models import ProtectedError

from .models import Empleado
from .serializers import (
    EmpleadoUserSerializer,
    EmpleadoCreateByAdminSerializer,
    EmpleadoUpdateSerializer,
    RolSerializer,
    MyTokenObtainPairSerializer
)

# Permisos
class IsAdministrador(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name__iexact="Administrador").exists() or request.user.is_staff

# --- Login JWT (email + password) usando serializer personalizado ---
#from rest_framework_simplejwt.views import TokenObtainPairView

#class MyTokenObtainPairView(TokenObtainPairView):
 #   serializer_class = MyTokenObtainPairSerializer

from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import MyTokenObtainPairSerializer

class LoginView(APIView):
    permission_classes = []  # Público

    def post(self, request, *args, **kwargs):
        serializer = MyTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)



# ----- Lista de empleados (solo admin) -----
class EmpleadoListView(generics.ListAPIView):
    queryset = User.objects.select_related('empleado').filter(groups__name__in=['Empleado', 'Administrador']).order_by('first_name')
    serializer_class = EmpleadoUserSerializer
    permission_classes = [IsAuthenticated, IsAdministrador]


# ----- Crear empleado (solo admin) -----
class EmpleadoCreateByAdminView(APIView):
    permission_classes = [IsAuthenticated, IsAdministrador]

    def post(self, request, *args, **kwargs):
        serializer = EmpleadoCreateByAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        empleado = serializer.save()
        return Response({"detail": "Empleado creado", "empleado_id": empleado.id}, status=status.HTTP_201_CREATED)


# ----- Actualizar Empleado (solo admin) -----
class EmpleadoUpdateView(generics.UpdateAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdministrador]
    lookup_field = "pk"
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar este empleado porque tiene registros (Ventas, Compras o Caja) asociados. Por favor, desactívelo en su lugar."},
                status=status.HTTP_400_BAD_REQUEST
            )


# ----- Eliminar usuario/empleado (solo admin) -----
class EmpleadoDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdministrador]
    lookup_field = "pk"


# ----- Listar roles (autenticado) -----
class RolListView(generics.ListAPIView):
    queryset = Group.objects.all().order_by('name')
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Lógica para determinar el rol (Idéntica a tu Login)
        role = "SinRol"
        if user.is_superuser or user.groups.filter(name="Administrador").exists():
            role = "Administrador"
        elif hasattr(user, "empleado"):
            role = user.empleado.rol.name if user.empleado.rol else "Empleado"
        elif hasattr(user, "cliente"):
            role = "Cliente"

        data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role,
        }

        # Si es empleado, agregamos datos extra útiles
        if hasattr(user, "empleado"):
            data["empleado_id"] = user.empleado.id
            
        return Response(data, status=status.HTTP_200_OK)