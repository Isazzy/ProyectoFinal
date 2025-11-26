from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Cliente
from .serializers import ClienteSerializer, ClienteRegisterSerializer

# ============================================
# IMPORTACIONES ADICIONALES PARA PASSWORD RESET
# ============================================
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings


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



# ============================================
# VISTAS DE PASSWORD RESET
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Solicitud de restablecimiento de contraseña.
    Endpoint: POST /api/clientes/password-reset/
    Body: { "email": "usuario@ejemplo.com" }
    """
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response(
            {'error': 'El correo electrónico es requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Buscar usuario por email
        user = User.objects.get(email=email)
        
        # Generar token de seguridad (válido por ~3 días por defecto)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Construir URL de reset para el frontend
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
        
        # Enviar email
        send_mail(
            subject='Restablecer tu Contraseña',
            message=f'''Hola {user.first_name or user.username},

Has solicitado restablecer tu contraseña.

Haz clic en el siguiente enlace para crear una nueva contraseña:
{reset_url}

Si no solicitaste este cambio, ignora este mensaje.

Este enlace expirará en 3 días.

Te saludan, atentamente:
El equipo de Romina Magallanez''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        # Respuesta genérica por seguridad
        return Response(
            {'message': 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.'}, 
            status=status.HTTP_200_OK
        )
        
    except User.DoesNotExist:
        # Por seguridad, no revelamos si el email existe o no
        return Response(
            {'message': 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.'}, 
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print(f"Error en password_reset_request: {str(e)}")  # Para debugging
        return Response(
            {'error': 'Hubo un error al procesar tu solicitud. Intenta nuevamente.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    """
    Confirmación y cambio de contraseña.
    Endpoint: POST /api/clientes/password-reset-confirm/<uidb64>/<token>/
    Body: { "new_password": "nuevaContraseña123" }
    """
    new_password = request.data.get('new_password', '').strip()
    
    if not new_password:
        return Response(
            {'error': 'La nueva contraseña es requerida'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'La contraseña debe tener al menos 8 caracteres'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decodificar el ID del usuario
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        # Verificar que el token sea válido y no haya expirado
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'El enlace es inválido o ha expirado. Solicita un nuevo enlace.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar la contraseña
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': '¡Tu contraseña ha sido restablecida exitosamente! Ya puedes iniciar sesión.'}, 
            status=status.HTTP_200_OK
        )
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'El enlace es inválido o ha expirado. Solicita un nuevo enlace.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Error en password_reset_confirm: {str(e)}")  # Para debugging
        return Response(
            {'error': 'Hubo un error al procesar tu solicitud.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
