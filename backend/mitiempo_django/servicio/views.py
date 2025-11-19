# servicio/views.py

from django.forms import ValidationError
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Servicio
from .serializers import ServicioSerializer


class ServicioViewSet(viewsets.ModelViewSet):
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    """
    API endpoint para ver y gestionar Servicios.
    """
    # El queryset base (usado por el admin)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
    queryset = Servicio.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
    
        if not user.is_authenticated or getattr(user, 'role', 'cliente') == 'cliente':
<<<<<<< HEAD
<<<<<<< HEAD
            return Servicio.objects.filter(activado=True).prefetch_related('servicioprofesional_set__profesional')
        
        # Admin/Empleados ven todo
        return self.queryset.prefetch_related('servicioprofesional_set__profesional')
=======
=======
    """
    API endpoint para Servicios en una peluquería:
    - CRUD completo: Crear, listar, ver, actualizar y eliminar servicios.
    - Restricciones: Solo la administradora puede modificar/eliminar; clientes solo ven servicios activos.
    - Lógica de negocio: Evita eliminación si hay citas/ventas asociadas; filtra por activos para clientes.
    """
    
    # Queryset base: ordena por nombre y filtra activos por defecto
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    queryset = Servicio.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    
<<<<<<< HEAD
        if not user.is_authenticated or getattr(user, 'role', 'cliente') == 'cliente':
            return Servicio.objects.filter(activado=True) 
        # Si es admin/staff, devolvemos el queryset completo (todos los servicios)
        return self.queryset 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
            # Devolvemos solo los servicios activos
            return Servicio.objects.filter(activado=True) # <-- .prefetch_related eliminado

        # Si es admin/staff, devolvemos el queryset completo (todos los servicios)
        return self.queryset # <-- .prefetch_related eliminado
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======
            return Servicio.objects.filter(activado=True) 
        # Si es admin/staff, devolvemos el queryset completo (todos los servicios)
        return self.queryset 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
    # Permisos: Autenticados, pero con lógica adicional en métodos para roles
    permission_classes = [permissions.IsAuthenticated]
    
    # Mejora: Paginación para listas grandes
    pagination_class = None  # Configura con PageNumberPagination si hay muchos servicios
    
    # Mejora: Filtros, búsqueda y orden dinámico
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['activado', 'precio_serv']  # Filtros por estado activo y precio
    search_fields = ['nombre_serv', 'descripcion']  # Búsqueda por nombre o descripción
    ordering_fields = ['nombre_serv', 'precio_serv', 'duracion_estimada']  # Orden por nombre, precio o duración
    
    def get_queryset(self):
        """
        Filtra el queryset dinámicamente:
        - Administradoras ven todos los servicios.
        - Clientes solo ven servicios activos (para evitar mostrar inactivos en apps móviles).
        Mejora privacidad y UX en la peluquería.
        """
        queryset = super().get_queryset()
        user = self.request.user
        # Asumiendo que 'role' en User indica 'cliente' o 'administradora'; ajusta si es diferente
        if hasattr(user, 'role') and user.role == 'cliente':
            queryset = queryset.filter(activado=True)
        return queryset
    
    def perform_create(self, serializer):
        """
        Crea un servicio: Solo la administradora puede crear.
        Restricción de negocio: La administradora maneja el catálogo de servicios.
        """
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'administracion':
            raise permissions.PermissionDenied("Solo la administradora puede crear servicios.")
        serializer.save()
    
    def perform_update(self, serializer):
        """
        Actualiza un servicio: Solo la administradora puede editar.
        El serializer ya maneja restricciones (e.g., no desactivar si hay citas pendientes).
        """
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'administracion':
            raise permissions.PermissionDenied("Solo la administradora puede actualizar servicios.")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Elimina un servicio: Solo la administradora puede eliminar, y con restricciones.
        El serializer ya valida asociaciones; aquí reforzamos permisos.
        Si hay asociaciones, sugiere desactivar en lugar de eliminar.
        """
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'administracion':
            raise permissions.PermissionDenied("Solo la administradora puede eliminar servicios.")
        try:
            instance.delete()  # El serializer maneja validaciones
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
