# inventario/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Producto, Tipo_Producto, Insumo, Categoria_Insumo, Producto_X_Insumo
from .serializers import (
    ProductoSerializer, ProductoWriteSerializer,
    TipoProductoSerializer,
    InsumoReadSerializer, InsumoWriteSerializer,
    CategoriaInsumoSerializer
)


# -------------------------
# PRODUCTOS
# -------------------------
class ProductoListCreateView(generics.ListCreateAPIView):
    queryset = Producto.objects.all().order_by("producto_nombre")
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        pedidos_relacionados = Detalle_Pedido.objects.filter(producto=instance)
        if pedidos_relacionados.exists():
            ids_pedidos = list(set([d.pedido.id for d in pedidos_relacionados.select_related("pedido")]))
            mensaje = f"Este producto no se puede borrar porque está en los pedidos: {ids_pedidos}"
            return Response({"detail": mensaje, "pedidos": ids_pedidos}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


# -------------------------
# TIPO PRODUCTO
# -------------------------
class TipoProductoListCreateView(generics.ListCreateAPIView):
    queryset = Tipo_Producto.objects.all().order_by("tipo_producto_nombre")
    serializer_class = TipoProductoSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class TipoProductoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tipo_Producto.objects.all()
    serializer_class = TipoProductoSerializer
    permission_classes = [permissions.IsAdminUser]


# -------------------------
# INSUMOS
# -------------------------
class InsumoListCreateView(generics.ListCreateAPIView):
    queryset = Insumo.objects.all().order_by("insumo_nombre")
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        productos_relacionados = Producto_X_Insumo.objects.filter(insumo=instance)
        if productos_relacionados.exists():
            nombres_productos = [r.producto.producto_nombre for r in productos_relacionados.select_related("producto")]
            mensaje = f"Este insumo no se puede borrar porque está en productos: {', '.join(nombres_productos)}"
            return Response({"detail": mensaje, "productos": nombres_productos}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


# -------------------------
# CATEGORÍAS DE INSUMO
# -------------------------
class CategoriaInsumoListCreateView(generics.ListCreateAPIView):
    queryset = Categoria_Insumo.objects.all().order_by("categoria_insumo_nombre")
    serializer_class = CategoriaInsumoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class CategoriaInsumoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria_Insumo.objects.all()
    serializer_class = CategoriaInsumoSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        insumos_relacionados = instance.insumo_set.all()
        if insumos_relacionados.exists():
            nombres_insumos = [i.insumo_nombre for i in insumos_relacionados]
            mensaje = f"No se puede borrar la categoría porque tiene insumos: {', '.join(nombres_insumos)}"
            return Response({"detail": mensaje, "insumos": nombres_insumos}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
