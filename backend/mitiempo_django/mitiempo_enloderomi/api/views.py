from rest_framework import generics, permissions, viewsets
from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from mitiempo_enloderomi.api.permissions import IsAdminRole
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

User = get_user_model()

#  Login con JWT personalizado
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

#  Registro público (clientes)
class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


#  CRUD de usuarios (solo para admins)
@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserCRUDSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminRole]  # Solo administradores

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()

        # Admin ve todos
        if getattr(user, "role", "").lower() == "admin":
            return User.objects.all().order_by("username")

        # Empleado o cliente solo ve su propio perfil
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        print("Creando usuario:", serializer.validated_data)
        serializer.save()

    # Endpoint autenticado: lista empleados activos
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def empleados(self, request):
        empleados = User.objects.filter(role="empleado", is_active=True)
        serializer = UserCRUDSerializer(empleados, many=True)
        return Response(serializer.data)


# Endpoint público — Profesionales visibles para clientes sin login
@api_view(['GET'])
@permission_classes([AllowAny])
def listar_profesionales(request):
    """
    Devuelve todos los profesionales disponibles:
    - role='empleado' o 'admin' con rol profesional asignado
    - días laborables
    """
    profesionales = User.objects.filter(
        role__in=["empleado", "admin"],
        is_active=True
    ).exclude(rol_profesional__isnull=True)

    data = [
        {
            "id": p.id,
            "nombre": f"{p.first_name} {p.last_name}".strip() or p.username,
            "profesion": p.rol_profesional,
            "dias_laborables": p.dias_laborables or [],
        }
        for p in profesionales
    ]
    return Response(data)
