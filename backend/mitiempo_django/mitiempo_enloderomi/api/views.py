from rest_framework import generics, permissions, viewsets
# 💡 Importamos el serializer correcto para Profile si es necesario (asumo que está en .serializers)
from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer 
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
# 💡 Asumo que IsAdminRole está en .permissions
from .permissions import IsAdminRole 
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

User = get_user_model()

# ----------------------------------------
# Vistas de Autenticación y Registro
# ----------------------------------------

class CustomLoginView(TokenObtainPairView):
    """ Vista para el login personalizado usando email. """
    serializer_class = CustomTokenObtainPairSerializer

class RegisterAPIView(generics.CreateAPIView):
    """ Vista para el registro público de nuevos clientes. """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] # Cualquiera puede registrarse


# ----------------------------------------
# ViewSet Principal para Usuarios (CRUD)
# ----------------------------------------

@method_decorator(csrf_exempt, name='dispatch') # Considera usar JWT en lugar de eximir CSRF si es posible
class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD sobre usuarios.
    Requiere autenticación y rol de administrador para la mayoría de las acciones.
    """
    queryset = User.objects.all().order_by("username")
    serializer_class = UserCRUDSerializer
    authentication_classes = [JWTAuthentication] # Usa autenticación JWT
    permission_classes = [IsAdminRole] # 💡 Por defecto, solo Admins pueden hacer CRUD

    def get_queryset(self):
        """
        Define qué usuarios puede ver el usuario autenticado.
        - Admin: ve todos.
        - Empleado/Cliente: solo se ve a sí mismo (a menos que se use una acción específica).
        """
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()

        if getattr(user, "role", "").lower() == "admin":
            return User.objects.all().order_by("username")
        
        # Por defecto, otros roles solo ven su propio perfil via /api/usuarios/{su_id}/
        # Ojo: La acción 'empleados' anula esto para listar empleados.
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        """ Lógica adicional al crear un usuario (ej. logging). """
        # La lógica de hashing de contraseña está en el serializer.
        print("Creando usuario:", serializer.validated_data) 
        serializer.save()

    # ----------------------------------------
    # Acciones Personalizadas del ViewSet
    # ----------------------------------------

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def empleados(self, request):
        """
        Endpoint protegido para listar todos los usuarios activos que son
        'empleado' o 'admin'. Usado por el frontend para la reserva de turnos.
        URL: /api/usuarios/empleados/
        """
        # --- CORRECCIÓN APLICADA ---
        # Incluir usuarios con rol 'empleado' O 'admin'
        empleados_y_admin = User.objects.filter(
            role__in=["empleado", "admin"], 
            is_active=True
        ).order_by("first_name", "last_name") # Ordenar alfabéticamente
        # ---------------------------
        
        # Usar el UserCRUDSerializer que incluye 'dias_laborables' y 'rol_profesional'
        serializer = self.get_serializer(empleados_y_admin, many=True) 
        return Response(serializer.data)


# ----------------------------------------
# Endpoints Adicionales (Fuera del ViewSet)
# ----------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny]) # Accesible públicamente
def listar_profesionales(request):
    """
    Devuelve una lista simplificada de profesionales (empleado o admin) 
    que están activos y tienen un rol profesional asignado.
    Ideal para mostrar en una sección pública del sitio web.
    URL: /api/usuarios/profesionales/
    """
    profesionales = User.objects.filter(
        role__in=["empleado", "admin"],
        is_active=True
    ).exclude(rol_profesional__isnull=True).exclude(rol_profesional__exact='') # Excluir nulos o vacíos

    # Formatear la salida manualmente para simplificarla
    data = [
        {
            "id": p.id,
            "nombre": f"{p.first_name} {p.last_name}".strip() or p.username,
            "profesion": p.rol_profesional,
            # Asegurarse que dias_laborables siempre sea una lista
            "dias_laborables": p.dias_laborables if isinstance(p.dias_laborables, list) else [], 
        }
        for p in profesionales
    ]
    return Response(data)