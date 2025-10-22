# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),

    # Autenticación JWT
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Usuarios
    path('api/usuarios/', include('mitiempo_enloderomi.api.urls')),

    # Servicios
    path('api/servicios/', include('turnos.urls_servicios')),

    # Turnos
    path('api/turnos/', include('turnos.urls')),
]
