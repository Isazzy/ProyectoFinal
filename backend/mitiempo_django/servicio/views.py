# servicios/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import Servicio
from .serializers import (
    ServicioListSerializer,
    ServicioDetailSerializer,
    ServicioCreateUpdateSerializer
)

# Permisos personalizados
class IsAdminOrEmpleado(permissions.BasePermission):
    """
    Permite acceso si el usuario está en grupo 'Administrador' o 'Empleado' o es staff.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        return user.groups.filter(name__in=['Administrador','Empleado']).exists()


class ServicioPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ServicioListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicioListSerializer
    pagination_class = ServicioPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Servicio.objects.all().order_by('nombre_serv')
        # filtros
        tipo = self.request.query_params.get('tipo')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        activo = self.request.query_params.get('activado')
        search = self.request.query_params.get('search')

        if tipo:
            qs = qs.filter(tipo_serv__icontains=tipo)
        if min_price:
            try:
                qs = qs.filter(precio_serv__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                qs = qs.filter(precio_serv__lte=float(max_price))
            except ValueError:
                pass
        if activo is not None:
            if str(activo).lower() in ['1','true','yes']:
                qs = qs.filter(activado=True)
            elif str(activo).lower() in ['0','false','no']:
                qs = qs.filter(activado=False)
        if search:
            qs = qs.filter(Q(nombre_serv__icontains=search) | Q(descripcion_serv__icontains=search))

        user = self.request.user
        if not (user.is_staff or user.groups.filter(name__in=['Administrador','Empleado']).exists()):
            qs = qs.filter(activado=True)

        return qs

    def get_serializer_class(self):
        # POST usa el serializer de escritura
        if self.request.method == 'POST':
            return ServicioCreateUpdateSerializer
        return ServicioListSerializer

    def perform_create(self, serializer):
        if not IsAdminOrEmpleado().has_permission(self.request, self):
            self.permission_denied(self.request, message="No tienes permiso para crear servicios.")
        serializer.save()


class ServicioDetailView(generics.RetrieveUpdateAPIView):
    queryset = Servicio.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrEmpleado]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ServicioCreateUpdateSerializer
        return ServicioDetailSerializer

    def perform_update(self, serializer):
        serializer.save()


# Toggle activado endpoint
from rest_framework.decorators import api_view, permission_classes

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrEmpleado])
def toggle_activado(request, pk):
    try:
        servicio = Servicio.objects.get(pk=pk)
    except Servicio.DoesNotExist:
        return Response({"detail":"Servicio no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    activado = request.data.get('activado', None)
    if activado is None:
        return Response({"detail":"Enviar campo 'activado' (true/false)."}, status=status.HTTP_400_BAD_REQUEST)

    servicio.activado = bool(activado)
    servicio.save()
    return Response({"id": servicio.id_serv, "activado": servicio.activado}, status=status.HTTP_200_OK)
