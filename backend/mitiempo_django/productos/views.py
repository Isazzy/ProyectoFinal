# productos/views.py
<<<<<<< HEAD
<<<<<<< HEAD
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Productos, Proveedores
from .serializer import ProductoSerializer, ProveedorSerializer, ProductoStockAjusteSerializer
# productos/views.py
from rest_framework.permissions import AllowAny

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Productos.objects.all().order_by('nombre_prod')
    serializer_class = ProductoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre_prod', 'tipo_prod']
    ordering_fields = ['nombre_prod', 'stock_act_prod', 'precio_venta']

    @action(detail=False, methods=['get'])
    def bajo_stock(self, request):
        qs = self.get_queryset().filter(stock_act_prod__lte=models.F('stock_min_prod'))
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        producto = self.get_object()
        ser = ProductoStockAjusteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        delta = ser.validated_data['delta']
        with transaction.atomic():
            nuevo = producto.stock_act_prod + delta
            if nuevo < 0:
                return Response(
                    {"detail": "El stock no puede quedar negativo."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            producto.stock_act_prod = nuevo
            producto.save(update_fields=['stock_act_prod'])
        return Response({"id_prod": producto.id_prod, "stock_act_prod": producto.stock_act_prod})

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedores.objects.all().order_by('nombre_prov')
    serializer_class = ProveedorSerializer
=======
from rest_framework import viewsets, status
from rest_framework.decorators import action
=======
from rest_framework import viewsets, mixins, status
>>>>>>> 67ec8a26 (Producto terminado (Creo))
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F, Q
from .models import Marca, Categoria, Productos, StockHistory
from .serializer import (
    MarcaSerializer, CategoriaSerializer,
    ProductosSerializer, ProductosCreateUpdateSerializer,
    StockHistorySerializer
)

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductosViewSet(viewsets.ModelViewSet):
    queryset = Productos.objects.select_related('marca', 'categoria').all()
    filterset_fields = [
        'marca', 'categoria', 'nombre_prod',
        'stock_act_prod', 'stock_min_prod', 'precio_venta', 'reposicion_prod'
    ]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductosCreateUpdateSerializer
        return ProductosSerializer

    # Alertas por bajo stock: devolver productos bajo mínimo
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        bajo_stock = request.query_params.get("bajo_stock")
        if bajo_stock == "1":
            queryset = queryset.filter(stock_act_prod__lte=F('stock_min_prod'))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class StockHistoryViewSet(viewsets.GenericViewSet,
                         mixins.ListModelMixin,
                         mixins.CreateModelMixin):
    queryset = StockHistory.objects.select_related("producto", "usuario").all()
    serializer_class = StockHistorySerializer
    filterset_fields = ["producto", "tipo_movimiento"]

    # Registra un ajuste de stock manual
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        producto_id = data.get("producto")
        tipo = data.get("tipo_movimiento", "AJUSTE")
        cantidad = int(data.get("cantidad_movida", 0))
        razon = data.get("razon", "")
        usuario = request.user if request.user.is_authenticated else None
        with transaction.atomic():
            prod = Productos.objects.select_for_update().get(id_prod=producto_id)
            stock_anterior = prod.stock_act_prod
            prod.stock_act_prod += cantidad
            prod.save(update_fields=["stock_act_prod"])
            movimiento = StockHistory.objects.create(
                producto=prod,
                tipo_movimiento=tipo,
                cantidad_movida=cantidad,
                stock_anterior=stock_anterior,
                stock_actual=prod.stock_act_prod,
                razon=razon,
                usuario=usuario
            )
<<<<<<< HEAD

        stock_anterior = producto.stock_act_prod
        stock_actual = stock_anterior + cantidad

        # 1. Validar que el stock no sea negativo
        if stock_actual < 0:
            return Response(
                {'error': f'Stock insuficiente. Solo hay {stock_anterior} unidades.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Actualizar el stock del producto
        producto.stock_act_prod = stock_actual
        producto.save()

        # 3. Crear el registro en el historial
        StockHistory.objects.create(
            producto=producto,
            tipo_movimiento='AJUSTE', # Usamos el tipo 'AJUSTE' del modelo
            cantidad_movida=cantidad, # Guardamos el valor (+10 o -5)
            stock_anterior=stock_anterior,
            stock_actual=stock_actual,
            razon=razon,
            # Asigna el usuario que hizo el ajuste (si está logueado)
            usuario=request.user if request.user.is_authenticated else None
        )
        
        # Devolvemos el producto actualizado
        return Response(
            ProductosSerializer(producto).data, 
            status=status.HTTP_200_OK
        )
>>>>>>> 874e3164 (reestructuracion de archivos)
=======
        serializer = self.get_serializer(movimiento)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
>>>>>>> 67ec8a26 (Producto terminado (Creo))
