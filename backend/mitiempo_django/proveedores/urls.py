from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProveedoresViewSet

router = DefaultRouter()
router.register(r'proveedores', ProveedoresViewSet, basename='proveedores')

urlpatterns = [
    path('', include(router.urls)),
]
