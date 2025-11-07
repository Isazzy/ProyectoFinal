from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Proveedores
from .serializers import ProveedoresSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class ProveedoresViewSet(viewsets.ModelViewSet):
    queryset = Proveedores.objects.all().order_by('nombre_prov')
    serializer_class = ProveedoresSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
