#turnos/views.py
from rest_framework import viewsets, permissions
from .models import Servicios, Turnos, TurnosXServicios
from .serializers import ServicioSerializer, TurnosSerializer, TurnosXServiciosSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import BasePermission, IsAuthenticatedOrReadOnly
from datetime import timedelta, datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta, time
from rest_framework import serializers

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
    """
    ViewSet para listar, crear y administrar servicios.
    Filtra automáticamente los servicios activos para los clientes.
    """
    queryset = Servicios.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        # Si el usuario es anónimo o cliente → solo mostrar los servicios activados
        if not user.is_authenticated or getattr(user, 'role', '') == 'cliente':
            return Servicios.objects.filter(activado=True).only(
                "id_serv", "nombre_serv", "descripcion_serv", "precio_serv", "duracion_serv", "rol_requerido"
            )

        # Si es admin o empleado → todos los servicios
        return Servicios.objects.all().only(
            "id_serv", "nombre_serv", "descripcion_serv", "precio_serv", "duracion_serv", "rol_requerido"
        )

    def perform_create(self, serializer):
        """
        Asigna valores por defecto si faltan campos opcionales.
        """
        servicio = serializer.save()
        if not servicio.duracion_serv:
            servicio.duracion_serv = timedelta(minutes=30)
            servicio.save()





class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turnos.objects.all().select_related('id_cli', 'id_prof')
    serializer_class = TurnosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        servicios_ids = self.request.data.get('servicios', [])
        servicios_objs = Servicios.objects.filter(id_serv__in=servicios_ids, activado=True)

        if not servicios_objs.exists():
            raise serializers.ValidationError("No se encontraron servicios válidos.")

        # Duración total de todos los servicios
        duracion_total = sum([s.duracion_serv.total_seconds() for s in servicios_objs if s.duracion_serv], 0)
        if duracion_total == 0:
            raise serializers.ValidationError("Al menos un servicio debe tener duración definida.")

        # Si el cliente no envía un profesional, asignamos automáticamente
        id_prof = self.request.data.get('id_prof')
        profesional = None

        if not id_prof:
            posibles_profesionales = User.objects.filter(
                role='empleado',
                turnos_profesional__servicio__in=servicios_objs
            ).distinct()

            if posibles_profesionales.count() == 1:
                profesional = posibles_profesionales.first()
            elif posibles_profesionales.count() > 1:
                profesional = posibles_profesionales.first()  # Podés mejorar la lógica según disponibilidad
            else:
                raise serializers.ValidationError("No hay profesionales disponibles para los servicios seleccionados.")
        else:
            profesional = User.objects.get(id=id_prof, role='empleado')

        # Fecha solicitada o hoy
        fecha_turno = self.request.data.get('fecha_turno')
        if not fecha_turno:
            fecha_turno = datetime.today().date()
        else:
            fecha_turno = datetime.strptime(fecha_turno, "%Y-%m-%d").date()

        # Obtener turnos existentes del profesional en esa fecha
        turnos = Turnos.objects.filter(id_prof=profesional, fecha_turno=fecha_turno)
        ocupados = []
        for t in turnos:
            start = datetime.combine(fecha_turno, t.hora_turno)
            end = start + timedelta(minutes=sum([s.duracion_serv.total_seconds()/60 for s in TurnosXServicios.objects.filter(id_turno=t).select_related('id_serv')]))
            ocupados.append((start, end))

        # Horarios base del profesional (ejemplo 9:00 a 17:00)
        inicio = datetime.combine(fecha_turno, time(hour=9, minute=0))
        fin = datetime.combine(fecha_turno, time(hour=17, minute=0))
        step = timedelta(minutes=15)  # check cada 15 min

        horario_asignado = None
        t = inicio
        while t + timedelta(seconds=duracion_total) <= fin:
            rango_turno = (t, t + timedelta(seconds=duracion_total))
            # verificar superposición
            if all(rango_turno[1] <= o[0] or rango_turno[0] >= o[1] for o in ocupados):
                horario_asignado = t.time()
                break
            t += step

        if not horario_asignado:
            raise serializers.ValidationError("No hay horarios disponibles para la duración combinada de los servicios.")

        # Guardar turno
        turno = serializer.save(id_cli=self.request.user, id_prof=profesional, fecha_turno=fecha_turno, hora_turno=horario_asignado)

        # Guardar relación TurnosXServicios
        for serv in servicios_objs:
            TurnosXServicios.objects.create(id_turno=turno, id_serv=serv)


class TurnosXServicosViewSet(viewsets.ModelViewSet):
    queryset = TurnosXServicios.objects.all().select_related('id_turno', 'id_serv')
    serializer_class = TurnosXServiciosSerializer
    permission_classes = [permissions.IsAuthenticated]
