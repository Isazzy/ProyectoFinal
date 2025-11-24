# inventario/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from decimal import Decimal
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

# Importaciones limpias
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
        # Regla: Usuarios normales no ven lo borrado (inactivo)
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductoWriteSerializer
        return ProductoSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class ProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProductoWriteSerializer
        return ProductoSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_destroy(self, instance):
        # SOFT DELETE: Marcar como inactivo en lugar de borrar
        instance.activo = False
        instance.save()


# -------------------------
# TIPO PRODUCTO
# -------------------------
class TipoProductoListCreateView(generics.ListCreateAPIView):
    serializer_class = TipoProductoSerializer

    def get_queryset(self):
        qs = Tipo_Producto.objects.all().order_by("tipo_producto_nombre")
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class TipoProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tipo_Producto.objects.all()
    serializer_class = TipoProductoSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_destroy(self, instance):
        # SOFT DELETE para tipos
        instance.activo = False
        instance.save()


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
        if self.request.method == "POST":
            return InsumoWriteSerializer
        return InsumoReadSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class InsumoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Insumo.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return InsumoWriteSerializer
        return InsumoReadSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_destroy(self, instance):
        # SOFT DELETE
        instance.activo = False
        instance.save()


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
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class CategoriaInsumoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria_Insumo.objects.all()
    serializer_class = CategoriaInsumoSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_destroy(self, instance):
        # Validación: No permitir borrar si tiene hijos activos
        if instance.insumo_set.filter(activo=True).exists():
             return Response(
                 {"detail": "No se puede eliminar categoría con insumos activos."}, 
                 status=status.HTTP_400_BAD_REQUEST
             )
        instance.activo = False
        instance.save()


# -------------------------
# MOVIMIENTO DE STOCK (INSUMOS)
# -------------------------
@api_view(['POST'])
def movimiento_stock(request, pk):
    insumo = get_object_or_404(Insumo, pk=pk)
    
    raw_cantidad = request.data.get('cantidad')
    if raw_cantidad is None:
        return Response({"detail": "El campo 'cantidad' es requerido."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        cantidad = Decimal(str(raw_cantidad))
    except Exception:
        return Response({"detail": "Cantidad inválida."}, status=status.HTTP_400_BAD_REQUEST)

    tipo = request.data.get('tipo') # 'ingreso' o 'egreso'

    if tipo == 'ingreso':
        insumo.insumo_stock += cantidad
    elif tipo == 'egreso':
        insumo.insumo_stock -= cantidad
    else:
        return Response({"detail": "Tipo de movimiento inválido (ingreso/egreso)."}, status=status.HTTP_400_BAD_REQUEST)
    
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
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class MarcaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def perform_destroy(self, instance):
        # SOFT DELETE
        instance.activo = False
        instance.save()