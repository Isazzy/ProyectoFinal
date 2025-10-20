from rest_framework import generics, permissions, viewsets
from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from mitiempo_enloderomi.api.permissions import IsAdminRole 
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

User = get_user_model()

#  Login con JWT personalizado
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


#  Registro público
class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# 👥 CRUD de usuarios
@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserCRUDSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminRole]  # admin para CRUD

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()

        # Admin ve todos
        if getattr(user, "role", "").lower() == "admin":
            return User.objects.all().order_by("username")

        # Empleado o cliente solo ve su propio registro
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        print("Creando usuario:", serializer.validated_data)
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def empleados(self, request):
        """
        Endpoint para listar profesionales disponibles.
        Admin y clientes pueden consultarlo, devuelve solo role='empleado'.
        """
        empleados = User.objects.filter(
            role="empleado",
            is_active=True
        )
        serializer = UserCRUDSerializer(empleados, many=True)
        return Response(serializer.data)