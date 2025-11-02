from rest_framework import generics, permissions, viewsets
from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer 
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .permissions import IsAdminRole 
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

User = get_user_model()

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] 
@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserCRUDSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminRole] 

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()

        if getattr(user, "role", "").lower() == "admin":
            return User.objects.all().order_by("username")
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        print("Creando usuario:", serializer.validated_data) 
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def empleados(self, request):
        empleados_y_admin = User.objects.filter(
            role__in=["empleado", "admin"], 
            is_active=True
        ).order_by("first_name", "last_name")
        serializer = self.get_serializer(empleados_y_admin, many=True) 
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def listar_profesionales(request):

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