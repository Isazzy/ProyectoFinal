from django.urls import path, include
from rest_framework.routers import DefaultRouter  # Importa el router de DRF.
from .views import ProductosViewSet  # Importa la vista.

router = DefaultRouter()  # Línea 1: Crea un enrutador.
router.register(r'productos', ProductosViewSet)  # Línea 2: Registra la vista con la ruta 'productos'.

urlpatterns = [
    path('', include(router.urls)),  # Línea 3: Incluye las rutas.
]