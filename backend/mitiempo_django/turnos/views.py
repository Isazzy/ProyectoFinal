from rest_framework import viewsets, permissions
from .models import Servicios, Turnos, TurnosXServicios
from .serializers import ServicioSerializer, TurnosSerializer, TurnosXServiciosSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import BasePermission, IsAuthenticatedOrReadOnly
from datetime import timedelta, datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

# --- Endpoint de horarios disponibles ---
@api_view(['GET'])
def horarios_disponibles(request):
  #Devuelve horarios disponibles para un profesional y una fecha
    id_prof = request.query_params.get('id_prof')
    fecha = request.query_params.get('fecha')

    if not id_prof or not fecha:
       return Response({'error': 'Faltan parámetros id_prof y fecha'}, status=400)

    try:
        profesional = User.objects.get(id=id_prof, role='empleado')
    except User.DoesNotExist:
       return Response({'error': 'Profesional no encontrado'}, status=404)

    # Validar día laborable
    dia_nombre = datetime.strptime(fecha, "%Y-%m-%d").strftime("%A")
    dias_validos = [d.lower() for d in profesional.dias_laborables or []]
    if dias_validos and dia_nombre.lower() not in dias_validos:
       return Response({'disponibles': [], 'mensaje': 'El profesional no trabaja ese día.'})

    # Turnos ocupados
    turnos = Turnos.objects.filter(id_prof=id_prof, fecha_turno=fecha)
    ocupados = [t.hora_turno.strftime('%H:%M') for t in turnos]

    # Horarios base (9:00–17:00 cada 30 minutos)
    inicio = datetime.strptime("09:00", "%H:%M").time()
    fin = datetime.strptime("17:00", "%H:%M").time()
    step = timedelta(minutes=30)

    actuales = []
    t = datetime.combine(datetime.today(), inicio)
    while t.time() <= fin:
        actuales.append(t.strftime("%H:%M"))
        t += step

    disponibles = [h for h in actuales if h not in ocupados]
    return Response({'disponibles': disponibles})


# --- Permisos personalizados ---
class IsAdminOrEmployee(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) in ["admin", "empleado"]
        )


# --- ViewSets ---
class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicios.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or getattr(user, 'role', '') == 'cliente':
            return Servicios.objects.filter(activado=True)
        return Servicios.objects.all()


class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turnos.objects.all().select_related('id_cli', 'id_prof')
    serializer_class = TurnosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(id_cli=self.request.user)


class TurnosXServicosViewSet(viewsets.ModelViewSet):
    queryset = TurnosXServicios.objects.all().select_related('id_turno', 'id_serv')
    serializer_class = TurnosXServiciosSerializer
    permission_classes = [permissions.IsAuthenticated]
