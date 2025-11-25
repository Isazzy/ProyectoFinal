from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Servicio, ServicioInsumo
from .serializers import (
    ServicioListSerializer, ServicioDetailSerializer, ServicioCreateUpdateSerializer,
    ServicioInsumoSerializer
)

# Permiso personalizado para escritura
class IsAdminOrEmpleado(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        return user.groups.filter(name__in=['Administrador', 'Empleado']).exists()


class ServicioPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ---------------------------------------------------------
#   LISTAR Y CREAR SERVICIOS
# ---------------------------------------------------------
class ServicioListCreateView(generics.ListCreateAPIView):
    pagination_class = ServicioPagination
    
    # No definimos permission_classes aquí estáticamente para poder variarlos

    def get_permissions(self):
        """
        GET: Público (AllowAny) para que los clientes vean servicios.
        POST: Solo Admin o Empleado puede crear.
        """
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminOrEmpleado()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Servicio.objects.all().order_by('nombre')
        
        # --- Filtros Query Params ---
        tipo = self.request.query_params.get('tipo')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        activo = self.request.query_params.get('activo')
        search = self.request.query_params.get('search')

        if tipo:
            qs = qs.filter(tipo__icontains=tipo)
        if min_price:
            try:
                qs = qs.filter(precio__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                qs = qs.filter(precio__lte=float(max_price))
            except ValueError:
                pass
        
        # Filtro de activo manual (si se envía en url)
        if activo is not None:
            if str(activo).lower() in ['1','true','yes']:
                qs = qs.filter(activo=True)
            elif str(activo).lower() in ['0','false','no']:
                qs = qs.filter(activo=False)
        
        if search:
            qs = qs.filter(Q(nombre__icontains=search) | Q(descripcion__icontains=search))

        # --- Regla de Visibilidad de Activos ---
        user = self.request.user
        
        # Si es anónimo (público) o es un cliente (no staff/empleado), SOLO ve los activos
        es_staff_o_empleado = False
        if user and user.is_authenticated:
             es_staff_o_empleado = user.is_staff or user.groups.filter(name__in=['Administrador','Empleado']).exists()
        
        if not es_staff_o_empleado:
            qs = qs.filter(activo=True)
            
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServicioCreateUpdateSerializer
        return ServicioListSerializer


# ---------------------------------------------------------
#   DETALLE, ACTUALIZAR Y BORRAR
# ---------------------------------------------------------
class ServicioDetailView(generics.RetrieveUpdateAPIView):
    queryset = Servicio.objects.all()
    
    def get_permissions(self):
        """
        GET: Público (AllowAny) para ver detalle.
        PUT/PATCH: Solo Admin o Empleado.
        """
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminOrEmpleado()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ServicioCreateUpdateSerializer
        return ServicioDetailSerializer


# Toggle activo (route: /servicios/<pk>/activo/)
@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrEmpleado])
def toggle_activo(request, pk):
    servicio = get_object_or_404(Servicio, pk=pk)
    activo = request.data.get('activo')
    if activo is None:
        return Response({"detail": "Enviar campo 'activo' (true/false)."}, status=status.HTTP_400_BAD_REQUEST)
    servicio.activo = bool(activo)
    servicio.save()
    return Response({"id": servicio.id, "activo": servicio.activo}, status=status.HTTP_200_OK)


# ----------------------------
# ServicioInsumo (CRUD) - Solo uso interno
# ----------------------------
class ServicioInsumoListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrEmpleado]
    serializer_class = ServicioInsumoSerializer

    def get_queryset(self):
        servicio_pk = self.request.query_params.get('servicio')
        qs = ServicioInsumo.objects.select_related('insumo', 'servicio').all()
        if servicio_pk:
            qs = qs.filter(servicio__pk=servicio_pk)
        return qs


class ServicioInsumoDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrEmpleado]
    queryset = ServicioInsumo.objects.select_related('insumo', 'servicio').all()
    serializer_class = ServicioInsumoSerializer


# ----------------------------
# Endpoints relacionados a Inventario/Stock
# ----------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def listar_insumos_disponibles(request):
    try:
        from inventario.models import Insumo
    except Exception:
        return Response({"detail": "App inventario no disponible"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    q = request.query_params.get('q')
    qs = Insumo.objects.all()
    if q:
        qs = qs.filter(insumo_nombre__icontains=q)
    qs = qs.filter(insumo_stock__gt=0).order_by('insumo_nombre')
    data = [{"id": i.id, "nombre": i.insumo_nombre, "unidad": i.insumo_unidad, "stock": float(i.insumo_stock)} for i in qs]
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrEmpleado])
def consumir_stock_manual(request):
    payload = request.data
    insumos = payload.get('insumos', [])
    if not isinstance(insumos, list) or not insumos:
        return Response({"detail": "Enviar lista 'insumos' con insumo_id y cantidad"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        from inventario.models import Insumo
    except Exception:
        return Response({"detail": "App inventario no disponible"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    with transaction.atomic():
        for item in insumos:
            insumo_id = item.get('insumo_id')
            cantidad = item.get('cantidad')
            if insumo_id is None or cantidad is None:
                return Response({"detail": "Cada item debe contener insumo_id y cantidad"}, status=status.HTTP_400_BAD_REQUEST)
            insumo = get_object_or_404(Insumo, pk=insumo_id)
            if insumo.insumo_stock < float(cantidad):
                return Response({"detail": f"Stock insuficiente para {insumo.insumo_nombre}"}, status=status.HTTP_400_BAD_REQUEST)
            insumo.insumo_stock -= float(cantidad)
            insumo.save()
    return Response({"detail": "Stock consumido correctamente"}, status=status.HTTP_200_OK)