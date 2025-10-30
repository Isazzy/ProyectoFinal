from django.shortcuts import render
# servicios/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Servicio
from .serializers import ServicioSerializer

class ServicioViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar Servicios.
    - Clientes (no autenticados o rol 'cliente') solo ven servicios 'activados'.
    - Admin/Empleados ven todos los servicios.
    """
    queryset = Servicio.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] # Usamos JWTAuthentication globalmente

    def get_queryset(self):
        user = self.request.user
        
        # Filtramos para clientes o usuarios no logueados
        if not user.is_authenticated or getattr(user, 'role', 'cliente') == 'cliente':
            return Servicio.objects.filter(activado=True).prefetch_related('servicioprofesional_set__profesional')
        
        # Admin/Empleados ven todo
        return self.queryset.prefetch_related('servicioprofesional_set__profesional')