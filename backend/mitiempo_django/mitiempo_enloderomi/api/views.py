from rest_framework import generics, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


# ------------------ PERMISOS ------------------
class IsAdminOrReadOnlyForEmpleado(BasePermission):
    """
    Admin: full access
    Empleado: solo puede ver usuarios de rol 'cliente'
    """
    def has_permission(self, request, view):
        role = getattr(request.user, "role", "").lower()
        if role == "admin":
            return True
        elif role == "empleado" and request.method in SAFE_METHODS:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, "role", "").lower()
        if role == "admin":
            return True
        elif role == "empleado" and request.method in SAFE_METHODS:
            # solo puede ver usuarios con rol 'cliente'
            return getattr(obj, "role", "").lower() == "cliente"
        return False


# ------------------ LOGIN / REGISTER ------------------
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # Cualquiera puede registrarse


# ------------------ USER VIEWSET ------------------
@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserCRUDSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminOrReadOnlyForEmpleado]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()

        role = getattr(user, "role", "").lower()
        if role == "admin":
            return User.objects.all().order_by("username")
        elif role == "empleado":
            # Empleado solo ve usuarios con rol 'cliente'
            return User.objects.filter(role="cliente", is_active=True).order_by("username")
        else:
            return User.objects.none()

    def perform_create(self, serializer):
        # Solo Admin puede crear
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def empleados(self, request):
        """
        Lista de empleados y admins activos.
        Solo Admin puede acceder completo, empleado solo ve clientes.
        """
        user = request.user
        role = getattr(user, "role", "").lower()

        if role == "admin":
            queryset = User.objects.filter(role__in=["empleado", "admin"], is_active=True).order_by("first_name", "last_name")
        elif role == "empleado":
            queryset = User.objects.filter(role="cliente", is_active=True).order_by("first_name", "last_name")
        else:
            queryset = User.objects.none()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ------------------ LISTAR PROFESIONALES ------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_profesionales(request):
    """
    Lista de profesionales (empleados o admins) con rol profesional asignado.
    Útil para seleccionar en formularios de turno.
    """
    profesionales = User.objects.filter(
        role__in=["empleado", "admin"],
        is_active=True
    ).exclude(rol_profesional__isnull=True).exclude(rol_profesional__exact='')

    data = [
        {
            "id": p.id,
            "nombre": f"{p.first_name} {p.last_name}".strip() or p.username,
            "profesion": p.rol_profesional,
            "dias_laborables": p.dias_laborables if isinstance(p.dias_laborables, list) else [],
        }
        for p in profesionales
    ]
    return Response(data)
