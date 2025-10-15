# turnos/urls_servicios.py
 
from rest_framework import routers
from .views import ServicioViewSet, horarios_disponibles

router = routers.DefaultRouter()
router.register(r'', ServicioViewSet, basename='servicios')

urlpatterns = router.urls

 #también incluimos la ruta para los horarios disponibles
from django.urls import path
urlpatterns += [
    path('horarios/', horarios_disponibles, name='horarios_disponibles'),
]
