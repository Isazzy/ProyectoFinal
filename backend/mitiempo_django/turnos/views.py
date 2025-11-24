from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.utils.dateparse import parse_date
from datetime import timedelta, datetime
from .models import Turno, ConfiguracionLocal
from .serializers import TurnoListSerializer, TurnoDetailSerializer, TurnoCreateSerializer, TurnoUpdateSerializer
from servicio.models import Servicio

def get_dia_semana_es(fecha):
    mapa = {'Monday':'lunes', 'Tuesday':'martes', 'Wednesday':'miercoles', 'Thursday':'jueves', 'Friday':'viernes', 'Saturday':'sabado', 'Sunday':'domingo'}
    return mapa.get(fecha.strftime('%A'), '').lower()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def horarios_disponibles(request):
    fecha_str = request.query_params.get('fecha')
    s_ids_str = request.query_params.get('servicios_ids')
    if not fecha_str or not s_ids_str:
        return Response({'error': 'Faltan parámetros'}, status=400)

    try:
        fecha = parse_date(fecha_str)
        s_ids = [int(x) for x in s_ids_str.split(',') if x.strip()]
    except:
        return Response({'error': 'Datos inválidos'}, status=400)

    # CORRECCIÓN: activo=True
    servicios = Servicio.objects.filter(id_serv__in=s_ids, activo=True)
    if servicios.count() != len(set(s_ids)):
        return Response({'error': 'Servicios inactivos o no encontrados'}, status=404)

    # CORRECCIÓN: .duracion
    total_min = sum(s.duracion for s in servicios)
    duracion_td = timedelta(minutes=total_min)

    config = ConfiguracionLocal.objects.first()
    if not config: return Response({'error': 'Sin config local'}, status=500)

    dia = get_dia_semana_es(fecha)
    if dia not in config.dias_abiertos:
        return Response({'disponibilidad': [], 'mensaje': f'Cerrado los {dia}'})

    tz = timezone.get_current_timezone()
    inicio = timezone.make_aware(datetime.combine(fecha, config.hora_apertura), timezone=tz)
    fin = timezone.make_aware(datetime.combine(fecha, config.hora_cierre), timezone=tz)
    paso = timedelta(minutes=config.tiempo_intervalo)

    ocupados = Turno.objects.filter(fecha_hora_inicio__date=fecha, estado__in=['pendiente','confirmado']).prefetch_related('servicios_asignados')
    bloqueos = []
    for t in ocupados:
        t_inicio = t.fecha_hora_inicio
        # CORRECCIÓN: Usar campo correcto de intermedia si fuera necesario, o sumar duraciones
        dur = sum(ts.duracion_servicio for ts in t.servicios_asignados.all())
        bloqueos.append((t_inicio, t_inicio + timedelta(minutes=dur)))

    slots = []
    now = timezone.now()
    curr = inicio
    while curr + duracion_td <= fin:
        if curr.date() == now.date() and curr <= now:
            curr += paso
            continue
        
        choque = False
        curr_end = curr + duracion_td
        for b_start, b_end in bloqueos:
            if b_start < curr_end and b_end > curr:
                choque = True
                break
        
        if not choque:
            slots.append(curr.strftime('%H:%M'))
        curr += paso

    return Response({'disponibilidad': slots, 'mensaje': ''})

class TurnosViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all().order_by('fecha_hora_inicio')
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Turno.objects.select_related('cliente').prefetch_related('servicios_asignados__servicio').order_by('fecha_hora_inicio')
        if not user.is_authenticated: return qs.none()
        if user.groups.filter(name='Cliente').exists():
            return qs.filter(cliente=user)
        return qs

    def get_serializer_class(self):
        if self.action == 'create': return TurnoCreateSerializer
        if self.action in ['update', 'partial_update']: return TurnoUpdateSerializer
        if self.action == 'retrieve': return TurnoDetailSerializer
        return TurnoListSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.groups.filter(name='Cliente').exists() and not user.is_staff:
            serializer.save(cliente=user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def solicitar_cancelacion(self, request, pk=None):
        t = self.get_object()
        if t.estado not in ['pendiente', 'confirmado']: return Response(status=400)
        t.estado = 'cancelado'
        t.save()
        return Response({'status': 'ok'})