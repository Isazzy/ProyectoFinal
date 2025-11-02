from django.shortcuts import render
# servicios/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Servicio
from .serializers import ServicioSerializer

class ServicioViewSet(viewsets.ModelViewSet):
<<<<<<< HEAD
    """
    API endpoint para ver y gestionar Servicios.
    """
    # El queryset base (usado por el admin)
    queryset = Servicio.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Sobrescribimos este método para filtrar lo que ve el usuario.
        - Clientes/Invitados: Solo ven servicios 'activados'.
        - Admin/Staff: Ven todos los servicios.
        """
        user = self.request.user
        
        # Si el usuario es un cliente o no está logueado
        if not user.is_authenticated or getattr(user, 'role', 'cliente') == 'cliente':
<<<<<<< HEAD
            return Servicio.objects.filter(activado=True).prefetch_related('servicioprofesional_set__profesional')
        
        # Admin/Empleados ven todo
        return self.queryset.prefetch_related('servicioprofesional_set__profesional')
=======
    queryset = Servicio.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
    
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
