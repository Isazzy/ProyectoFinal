from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action # <- Importa action
from rest_framework.response import Response # <- Importa Response
from django.db import transaction # <- Importa transaction
from rest_framework import viewsets, filters
from .models import Productos, StockHistory
from .serializer import ProductosSerializer, StockHistorySerializer
# Import Q to allow for complex lookups/filtering
from django.db.models import Q 

class ProductosViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Product instances.
    Handles all CRUD operations (GET, POST, PUT, DELETE).
    """
    queryset = Productos.objects.all()
    serializer_class = ProductosSerializer
    
    # 📝 Configuration for Filtering and Searching
    # Allows users to filter by fields in the model
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    # Define which fields can be searched. 'icontains' makes the search case-insensitive.
    # This addresses the requirement: "filtrar búsquedas por marca, nro de lote" (We'll use existing fields for now)
    search_fields = [
        'nombre_prod', 
        'tipo_prod', 
        # Add a field for 'marca' (brand) or 'nro de lote' (batch number) 
        # if you add those to your Productos model later.
    ]
    
    # You could also override get_queryset for more complex, custom filtering:
    # def get_queryset(self):
    #     queryset = super().get_queryset()
    #     # Example for filtering by low stock (Alerts by low stock)
    #     low_stock_status = self.request.query_params.get('low_stock', None)
    #     if low_stock_status == 'true':
    #         # Filters where current stock is below minimum stock
    #         queryset = queryset.filter(stock_act_prod__lt=models.F('stock_min_prod'))
    #     return queryset# productos/views.py

# (Tus imports existentes...)

class ProductosViewSet(viewsets.ModelViewSet):
    # (Tus definiciones de queryset, serializer_class, y filtros existentes...)
    queryset = Productos.objects.all()
    serializer_class = ProductosSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre_prod', 'tipo_prod']

    @action(detail=True, methods=['post'], url_path='descontar')
    def descontar_stock(self, request, pk=None):
        """
        Endpoint para descontar stock (por venta o uso).
        Requiere { "cantidad": <int>, "razon": "<string>" } en el cuerpo de la solicitud POST.
        """
        try:
            producto = self.get_object() # Obtiene el producto por el 'pk' de la URL
        except Productos.DoesNotExist:
            return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Validar datos de entrada
        cantidad_a_descontar = request.data.get('cantidad')
        razon = request.data.get('razon', 'Venta/Uso')
        
        if not cantidad_a_descontar or not isinstance(cantidad_a_descontar, int) or cantidad_a_descontar <= 0:
            return Response({'error': 'La cantidad debe ser un número entero positivo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if cantidad_a_descontar > producto.stock_act_prod:
            return Response({'error': f'Stock insuficiente. Solo quedan {producto.stock_act_prod} unidades.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Ejecutar la transacción de actualización y registro (asegura la atomicidad)
        try:
            with transaction.atomic():
                stock_anterior = producto.stock_act_prod
                
                # Descontar el stock
                producto.stock_act_prod -= cantidad_a_descontar
                producto.save()
                
                # Crear el registro de historial
                StockHistory.objects.create(
                    producto=producto,
                    tipo_movimiento='SALIDA',
                    cantidad_movida=cantidad_a_descontar,
                    stock_anterior=stock_anterior,
                    stock_actual=producto.stock_act_prod,
                    razon=razon
                )
                
                # 3. Respuesta de éxito
                serializer = self.get_serializer(producto)
                return Response({
                    'message': 'Stock descontado exitosamente.',
                    'producto': serializer.data
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Ocurrió un error al procesar el descuento: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# También puedes crear un ViewSet separado para el historial si quieres gestionar los registros
class StockHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset de solo lectura para visualizar el historial de movimientos de stock."""
    queryset = StockHistory.objects.all().order_by('-fecha_movimiento')
    serializer_class = StockHistorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['producto__nombre_prod', 'razon', 'tipo_movimiento']