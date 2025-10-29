# productos/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProductosViewSet, StockHistoryViewSet 

router = DefaultRouter()
router.register(r'productos', ProductosViewSet)
# Añadir el endpoint para ver el historial
router.register(r'historial', StockHistoryViewSet) 

urlpatterns = router.urls