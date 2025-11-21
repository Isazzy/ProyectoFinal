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
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ----- Lista de empleados (solo admin) -----
class EmpleadoListView(generics.ListAPIView):
    queryset = User.objects.select_related('empleado').all().order_by('first_name')
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

# ----- Eliminar usuario/empleado (solo admin) -----
class EmpleadoDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdministrador]
    lookup_field = "pk"

# ----- Listar roles (autenticado) -----
from .serializers import RolSerializer
class RolListView(generics.ListAPIView):
    queryset = Group.objects.all().order_by('name')
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]
