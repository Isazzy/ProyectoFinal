<<<<<<< HEAD
<<<<<<< HEAD
from django.shortcuts import render

# Create your views here.
=======
# compras/views.py

=======
# compras/views.py

>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError  # Nueva importación para validaciones

from .models import Proveedores, Compra, DetalleCompra, productos_x_proveedores
from .serializers import (
    ProveedoresSerializer,
    CompraSerializer,
    CompraDetalleSerializer,
    CompraListSerializer,
    DetalleCompraSerializer,
    productos_x_proveedoresSerializer
)


class ProveedoresViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Proveedores
    
    Endpoints:
    - GET /api/proveedores/ - Listar todos
    - POST /api/proveedores/ - Crear proveedor
    - GET /api/proveedores/{id}/ - Detalle de proveedor
    - PUT/PATCH /api/proveedores/{id}/ - Actualizar
    - DELETE /api/proveedores/{id}/ - Eliminar
    - GET /api/proveedores/activos/ - Solo proveedores activos
    - GET /api/proveedores/{id}/productos/ - Productos del proveedor
    - GET /api/proveedores/{id}/historial_compras/ - Historial de compras
    """
    queryset = Proveedores.objects.all()
    serializer_class = ProveedoresSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Permite filtrar proveedores por query params
        Ejemplo: /api/proveedores/?activo=true&search=nombre
        """
        queryset = Proveedores.objects.all()
        
        # Filtro por activo: aceptar solo 'true' o 'false' (case-insensitive),
        # ignorar valores vacíos o nulos (así '' no filtra).
        activo = self.request.query_params.get('activo', None)
        if activo is not None:
            activo_val = activo.strip().lower()
            if activo_val in ('true', 'false'):
                queryset = queryset.filter(activo=(activo_val == 'true'))
            else:
                # si viene vacío u otro valor, no aplicamos filtro
                pass
        
        # Filtro por tipo
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo_prov__icontains=tipo)
        
        # Búsqueda por nombre
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nombre_prov__icontains=search) |
                Q(correo__icontains=search)
            )
        
        return queryset.order_by('nombre_prov')
    
    def update(self, request, *args, **kwargs):
        # Nueva regla: Solo permitir actualización si el proveedor existe (refuerza modelo)
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    def destroy(self, request, *args, **kwargs):
        # Nueva regla: Capturar error de eliminación del modelo
        try:
            return super().destroy(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Endpoint personalizado: /api/proveedores/activos/
        Retorna solo proveedores activos
        """
        proveedores = self.queryset.filter(activo=True)
        serializer = self.get_serializer(proveedores, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        """
        Endpoint: /api/proveedores/{id}/productos/
        Lista productos que vende este proveedor
        """
        proveedor = self.get_object()
        productos_proveedor = ProductoXProveedor.objects.filter(id_prov=proveedor)
        serializer = ProductoXProveedorSerializer(productos_proveedor, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def historial_compras(self, request, pk=None):
        """
        Endpoint: /api/proveedores/{id}/historial_compras/
        Historial de compras a este proveedor
        """
        proveedor = self.get_object()
        compras = Compra.objects.filter(proveedor=proveedor).order_by('-fecha_hs_comp')
        serializer = CompraListSerializer(compras, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """
        Endpoint: POST /api/proveedores/{id}/desactivar/
        Desactiva un proveedor (soft delete)
        """
        proveedor = self.get_object()
        proveedor.activo = False
        proveedor.save()
        return Response({
            'message': f'Proveedor {proveedor.nombre_prov} desactivado exitosamente'
        })
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """
        Endpoint: POST /api/proveedores/{id}/activar/
        Activa un proveedor
        """
        proveedor = self.get_object()
        proveedor.activo = True
        proveedor.save()
        return Response({
            'message': f'Proveedor {proveedor.nombre_prov} activado exitosamente'
        })


class CompraViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Compras
    
    Endpoints:
    - GET /api/compras/ - Listar todas las compras
    - POST /api/compras/ - Crear compra con detalles
    - GET /api/compras/{id}/ - Detalle de compra
    - PUT/PATCH /api/compras/{id}/ - Actualizar
    - DELETE /api/compras/{id}/ - Eliminar
    - POST /api/compras/{id}/completar/ - Marcar como completada
    - POST /api/compras/{id}/cancelar/ - Cancelar compra
    - GET /api/compras/estadisticas/ - Estadísticas de compras
    - GET /api/compras/por_fecha/ - Filtrar por rango de fechas
    """
    queryset = Compra.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Usa diferentes serializadores según la acción
        """
        if self.action == 'list':
            return CompraListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CompraDetalleSerializer
        return CompraSerializer
    
    def get_queryset(self):
        """
        Filtros por query params:
        - ?estado=COMPLETADA
        - ?proveedor=1
        - ?fecha_desde=2024-01-01
        - ?fecha_hasta=2024-12-31
        """
        queryset = Compra.objects.select_related('proveedor', 'ro_usuario').prefetch_related('detalles')
        
        # Filtro por estado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtro por proveedor
        proveedor = self.request.query_params.get('proveedor', None)
        if proveedor:
            queryset = queryset.filter(proveedor_id=proveedor)
        
        # Filtro por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha_desde:
            queryset = queryset.filter(fecha_hs_comp__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_hs_comp__lte=fecha_hasta)
        
        return queryset.order_by('-fecha_hs_comp')
    
    def perform_create(self, serializer):
        """
        Al crear, asigna automáticamente el usuario actual
        """
        serializer.save(ro_usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def completar(self, request, pk=None):
        """
        Endpoint: POST /api/compras/{id}/completar/
        Marca la compra como completada
        """
        compra = self.get_object()
        
        if compra.estado == 'COMPLETADA':
            return Response(
                {'error': 'La compra ya está completada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if compra.estado == 'CANCELADA':
            return Response(
                {'error': 'No se puede completar una compra cancelada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        compra.estado = 'COMPLETADA'
        compra.save()
        
        serializer = self.get_serializer(compra)
        return Response({
            'message': 'Compra completada exitosamente',
            'compra': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Endpoint: POST /api/compras/{id}/cancelar/
        Cancela una compra
        """
        compra = self.get_object()
        
        if compra.estado == 'COMPLETADA':
            return Response(
                {'error': 'No se puede cancelar una compra completada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        compra.estado = 'CANCELADA'
        compra.save()
        
        serializer = self.get_serializer(compra)
        return Response({
            'message': 'Compra cancelada exitosamente',
            'compra': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Endpoint: GET /api/compras/estadisticas/
        Retorna estadísticas generales de compras
        """
        # Total de compras completadas
        compras_completadas = Compra.objects.filter(estado='COMPLETADA')
        
        total_compras = compras_completadas.count()
        monto_total = compras_completadas.aggregate(
            total=Sum('total_compra')
        )['total'] or 0
        
        # Compras del mes actual
        hoy = timezone.now()
        inicio_mes = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        compras_mes = compras_completadas.filter(
            fecha_hs_comp__gte=inicio_mes
        )
        
        total_mes = compras_mes.count()
        monto_mes = compras_mes.aggregate(
            total=Sum('total_compra')
        )['total'] or 0
        
        # Top 5 proveedores
        top_proveedores = Compra.objects.filter(
            estado='COMPLETADA'
        ).values(
            'proveedor__nombre_prov'
        ).annotate(
            total_comprado=Sum('total_compra'),
            cantidad_compras=Count('id_compra')
        ).order_by('-total_comprado')[:5]
        
        return Response({
            'total_compras': total_compras,
            'monto_total': monto_total,
            'compras_mes': total_mes,
            'monto_mes': monto_mes,
            'top_proveedores': list(top_proveedores)
        })
    
    @action(detail=False, methods=['get'])
    def por_fecha(self, request):
        """
        Endpoint: GET /api/compras/por_fecha/?dias=30
        Compras de los últimos N días (default: 7)
        """
        dias = int(request.query_params.get('dias', 7))
        fecha_inicio = timezone.now() - timedelta(days=dias)
        
        compras = Compra.objects.filter(
            fecha_hs_comp__gte=fecha_inicio
        ).order_by('-fecha_hs_comp')
        
        serializer = CompraListSerializer(compras, many=True)
        return Response({
            'periodo': f'Últimos {dias} días',
            'cantidad': compras.count(),
            'compras': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        # Nueva regla: No permitir actualización si la compra está completada
        instance = self.get_object()
        if instance.estado == 'COMPLETADA':
            return Response({"error": "No se puede modificar una compra completada."}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)
    def destroy(self, request, *args, **kwargs):
        # Nueva regla: Capturar error de eliminación del modelo
        try:
            return super().destroy(request, *args, **kwargs)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class DetalleCompraViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para DetalleCompra
    
    Endpoints:
    - GET /api/detalles-compra/ - Listar todos los detalles
    - GET /api/detalles-compra/{id}/ - Detalle específico
    """
    queryset = DetalleCompra.objects.select_related('id_compra', 'producto')
    serializer_class = DetalleCompraSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar detalles por compra
        Ejemplo: /api/detalles-compra/?compra=1
        """
        queryset = DetalleCompra.objects.all()
        
        compra_id = self.request.query_params.get('compra', None)
        if compra_id:
            queryset = queryset.filter(id_compra_id=compra_id)
        
        return queryset.order_by('-id_compra__fecha_hs_comp')


class productos_x_proveedoresViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar relación Producto-Proveedor
    
    Endpoints:
    - GET /api/productos-proveedores/ - Listar todas las relaciones
    - POST /api/productos-proveedores/ - Crear relación
    - GET /api/productos-proveedores/{id}/ - Detalle
    - PUT/PATCH /api/productos-proveedores/{id}/ - Actualizar
    - DELETE /api/productos-proveedores/{id}/ - Eliminar
    """
    queryset = productos_x_proveedores.objects.select_related('id_prod', 'id_prov')
    serializer_class = productos_x_proveedoresSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtros:
        - ?producto=1
        - ?proveedor=1
        """
        queryset = productos_x_proveedores.objects.all()
        
        producto = self.request.query_params.get('producto', None)
        if producto:
            queryset = queryset.filter(id_prod_id=producto)
        
        proveedor = self.request.query_params.get('proveedor', None)
        if proveedor:
            queryset = queryset.filter(id_prov_id=proveedor)
        
<<<<<<< HEAD
        return queryset.order_by('-d_compra')
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
        return queryset.order_by('-d_compra')
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
