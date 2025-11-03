# productos/views.py
from rest_framework import viewsets, mixins, status
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
        serializer = self.get_serializer(movimiento)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
