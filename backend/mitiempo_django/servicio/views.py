from django.shortcuts import render
# servicios/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Servicio
from .serializers import ServicioSerializer

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all().order_by('nombre_serv')
    serializer_class = ServicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        # Si no está autenticado o pertenece al grupo "Cliente", solo ve servicios activos
        if not user.is_authenticated or user.groups.filter(name='Cliente').exists():
            return Servicio.objects.filter(activado=True)

        # Si es staff o superusuario, ve todos
        return self.queryset
