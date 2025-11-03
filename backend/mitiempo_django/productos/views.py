# productos/views.py
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
