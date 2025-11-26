# inventario/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import ProtectedError, F # <--- CLAVE PARA EL BORRADO INTELIGENTE

from .models import Producto, Tipo_Producto, Insumo, Categoria_Insumo, Marca
from .serializers import (
    ProductoSerializer, ProductoWriteSerializer,
    TipoProductoSerializer,
    InsumoReadSerializer, InsumoWriteSerializer,
    CategoriaInsumoSerializer,
    MarcaSerializer
)

# -------------------------
# PRODUCTOS
# -------------------------
class ProductoListCreateView(generics.ListCreateAPIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        qs = Producto.objects.all().order_by("producto_nombre")
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs
    def get_serializer_class(self):
        return ProductoWriteSerializer if self.request.method == "POST" else ProductoSerializer
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method == "POST" else [permissions.IsAuthenticated()]

class ProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_serializer_class(self):
        return ProductoWriteSerializer if self.request.method in ["PUT", "PATCH"] else ProductoSerializer
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method in ["PUT", "PATCH", "DELETE"] else [permissions.IsAuthenticated()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            # 1. Intentamos borrado físico
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            # 2. Si hay relación (Compras/Ventas), desactivamos
            instance.activo = False
            instance.save()
            return Response(
                {
                    "message": "El producto tiene historial asociado. Se ha desactivado.",
                    "action": "soft_delete",
                    "id": instance.id
                }, 
                status=status.HTTP_200_OK
            )

# -------------------------
# TIPOS DE PRODUCTO
# -------------------------
class TipoProductoListCreateView(generics.ListCreateAPIView):
    serializer_class = TipoProductoSerializer
    def get_queryset(self):
        qs = Tipo_Producto.objects.all().order_by("tipo_producto_nombre")
        # Para catálogos de gestión, a veces es útil ver los inactivos si eres admin
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method == "POST" else [permissions.IsAuthenticated()]

class TipoProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tipo_Producto.objects.all()
    serializer_class = TipoProductoSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            instance.activo = False
            instance.save()
            return Response(
                {
                    "message": "El tipo de producto está en uso. Se ha desactivado.",
                    "action": "soft_delete",
                    "id": instance.id
                }, 
                status=status.HTTP_200_OK
            )

# -------------------------
# INSUMOS
# -------------------------
class InsumoListCreateView(generics.ListCreateAPIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        qs = Insumo.objects.all().order_by("insumo_nombre")
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs
    def get_serializer_class(self):
        return InsumoWriteSerializer if self.request.method == "POST" else InsumoReadSerializer
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method == "POST" else [permissions.IsAuthenticated()]

class InsumoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Insumo.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_serializer_class(self):
        return InsumoWriteSerializer if self.request.method in ["PUT", "PATCH"] else InsumoReadSerializer
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method in ["PUT", "PATCH", "DELETE"] else [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            instance.activo = False
            instance.save()
            return Response(
                {
                    "message": "El insumo tiene historial (Compras/Recetas). Se ha desactivado.",
                    "action": "soft_delete",
                    "id": instance.id
                }, 
                status=status.HTTP_200_OK
            )

# -------------------------
# CATEGORÍAS DE INSUMO
# -------------------------
class CategoriaInsumoListCreateView(generics.ListCreateAPIView):
    serializer_class = CategoriaInsumoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Categoria_Insumo.objects.all().order_by("categoria_insumo_nombre")
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method == "POST" else [permissions.IsAuthenticated()]

class CategoriaInsumoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria_Insumo.objects.all()
    serializer_class = CategoriaInsumoSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            instance.activo = False
            instance.save()
            return Response(
                {
                    "message": "La categoría tiene insumos asociados. Se ha desactivado.",
                    "action": "soft_delete",
                    "id": instance.id
                }, 
                status=status.HTTP_200_OK
            )

# -------------------------
# MOVIMIENTO DE STOCK
# -------------------------
@api_view(['POST'])
def movimiento_stock(request, pk):
    insumo = get_object_or_404(Insumo, pk=pk)
    raw_cantidad = request.data.get('cantidad')
    if raw_cantidad is None:
        return Response({"detail": "Campo 'cantidad' requerido."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        cantidad = Decimal(str(raw_cantidad))
    except Exception:
        return Response({"detail": "Cantidad inválida."}, status=status.HTTP_400_BAD_REQUEST)
    
    tipo = request.data.get('tipo') 
    if tipo == 'ingreso':
        insumo.insumo_stock += cantidad
    elif tipo == 'egreso':
        insumo.insumo_stock -= cantidad
    else:
        return Response({"detail": "Tipo de movimiento inválido."}, status=status.HTTP_400_BAD_REQUEST)
    
    insumo.save()
    return Response({"status": "ok", "nuevo_stock": float(insumo.insumo_stock)})

# -------------------------
# MARCAS
# -------------------------
class MarcaListCreateView(generics.ListCreateAPIView):
    serializer_class = MarcaSerializer
    def get_queryset(self):
        qs = Marca.objects.all().order_by("nombre")
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method == "POST" else [permissions.IsAuthenticated()]

class MarcaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    def get_permissions(self):
        return [permissions.IsAdminUser()] if self.request.method in ["PUT", "PATCH", "DELETE"] else [permissions.IsAuthenticated()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            instance.activo = False
            instance.save()
            return Response(
                {
                    "message": "La marca tiene productos/insumos asociados. Se ha desactivado.",
                    "action": "soft_delete",
                    "id": instance.id
                }, 
                status=status.HTTP_200_OK
            )
        
# -------------------------
# ALERTAS DE STOCK (Para Dashboard)
# -------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def alertas_stock(request):
    """
    Retorna insumos y productos que están en o por debajo de su stock mínimo.
    Solo considera ítems activos.
    """
    # 1. Insumos Bajos
    insumos = Insumo.objects.filter(
        activo=True,
        insumo_stock__lte=F('insumo_stock_minimo')
    ).values('id', 'insumo_nombre', 'insumo_stock', 'insumo_stock_minimo', 'insumo_unidad')

    # 2. Productos Bajos
    productos = Producto.objects.filter(
        activo=True,
        stock__lte=F('stock_minimo')
    ).values('id', 'producto_nombre', 'stock', 'stock_minimo')

    alertas = []

    for i in insumos:
        alertas.append({
            'id': i['id'],
            'tipo': 'insumo',
            'nombre': i['insumo_nombre'],
            'stock_actual': float(i['insumo_stock']),
            'stock_minimo': float(i['insumo_stock_minimo']),
            'unidad': i['insumo_unidad']
        })

    for p in productos:
        alertas.append({
            'id': p['id'],
            'tipo': 'producto',
            'nombre': p['producto_nombre'],
            'stock_actual': float(p['stock']),
            'stock_minimo': float(p['stock_minimo']),
            'unidad': 'unid.'
        })

    return Response(alertas)