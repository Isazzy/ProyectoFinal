from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


# 🔹 Permisos personalizados
class IsInGroup(BasePermission):
    group_name = None

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name=self.group_name).exists()
        )


class IsAdminGroup(IsInGroup):
    group_name = "Administrador"


class IsEmpleadoGroup(IsInGroup):
    group_name = "Empleado"


class IsClienteGroup(IsInGroup):
    group_name = "Cliente"


# 🔹 Login con JWT
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# 🔹 Registro desde la web (clientes nuevos)
class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# 🔹 Panel (admin / empleado)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserCRUDSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        user = self.request.user
        if not user.is_authenticated:
            return [AllowAny()]
        if user.groups.filter(name="Administrador").exists():
            return [IsAdminGroup()]
        if user.groups.filter(name="Empleado").exists():
            return [IsEmpleadoGroup()]
        if user.groups.filter(name="Cliente").exists():
            return [IsClienteGroup()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name="Administrador").exists():
            return User.objects.all().order_by("username")

        elif user.groups.filter(name="Empleado").exists():
            # Empleado solo puede ver clientes
            cliente_group, _ = Group.objects.get_or_create(name="Cliente")
            return User.objects.filter(groups=cliente_group).order_by("username")

        return User.objects.none()

    # 🔹 Bloquear creación, edición o eliminación si es empleado
    def create(self, request, *args, **kwargs):
        if request.user.groups.filter(name="Empleado").exists():
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"detail": "No tienes permiso para crear usuarios."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.groups.filter(name="Empleado").exists():
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"detail": "No tienes permiso para editar usuarios."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.groups.filter(name="Empleado").exists():
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"detail": "No tienes permiso para eliminar usuarios."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
