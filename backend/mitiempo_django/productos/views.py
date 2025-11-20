# productos/views.py
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
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated # Opcional: para proteger tu API
from .models import Productos, Marca, Categoria, StockHistory
from .serializer import (
    ProductosSerializer, 
    MarcaSerializer, 
    CategoriaSerializer,
    StockAjusteSerializer
)

class MarcaViewSet(viewsets.ModelViewSet):
    """API endpoint para Marcas."""
    queryset = Marca.objects.all().order_by('nombre')
    serializer_class = MarcaSerializer
    # permission_classes = [IsAuthenticated] # Descomenta para proteger

class CategoriaViewSet(viewsets.ModelViewSet):
    """API endpoint para Categorías."""
    queryset = Categoria.objects.all().order_by('nombre')
    serializer_class = CategoriaSerializer
    # permission_classes = [IsAuthenticated] # Descomenta para proteger

class ProductosViewSet(viewsets.ModelViewSet):
    """API endpoint para Productos."""
    queryset = Productos.objects.all().order_by('nombre_prod')
    serializer_class = ProductosSerializer
    # permission_classes = [IsAuthenticated] # Descomenta para proteger

    @action(detail=True, methods=['post'], url_path='ajustar-stock')
    def ajustar_stock(self, request, pk=None):
        """
        Acción personalizada para ajustar el stock de un producto.
        Recibe: { "cantidad": -5, "razon": "Producto vencido" }
        o:      { "cantidad": 10, "razon": "Inventario inicial" }
        """
        producto = self.get_object() # Obtiene el producto (ej: /api/productos/1/ajustar-stock/)
        serializer = StockAjusteSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cantidad = serializer.validated_data['cantidad']
        razon = serializer.validated_data.get('razon', 'Ajuste manual')
        
        if cantidad == 0:
            return Response(
                {'error': 'La cantidad no puede ser cero.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

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
