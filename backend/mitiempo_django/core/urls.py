from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from empleado.views import  LoginView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/empleado/', include('empleado.urls')),
    path('api/cliente/', include('cliente.urls')),
    # Login universal para clientes + empleados + admin
    path('api/login/', LoginView.as_view()),path("login/", LoginView.as_view(), name="token_obtain_pair"),
   # path('api/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/caja/', include('caja.urls')),
    path('api/movimiento-caja/', include('movimiento_caja.urls')),
    path('api/inventario/', include('inventario.urls')),
    path('api/servicio/', include('servicio.urls')),
    path('api/turnos/', include('turnos.urls')),
    path('api/ventas/', include('ventas.urls')),
    path('api/compras/', include('compras.urls')),
    #path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
   # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



