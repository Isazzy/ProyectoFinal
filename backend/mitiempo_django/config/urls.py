# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

# 💡 1. IMPORTA TU VISTA PERSONALIZADA
# (Asegúrate que la ruta de importación sea correcta desde la raíz del proyecto)
from mitiempo_enloderomi.api.views import CustomLoginView 

urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),

    # Autenticación JWT
    # 💡 2. REEMPLAZA LA VISTA GENÉRICA POR LA TUYA
    path('api/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    
    # Esta se mantiene igual
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Usuarios
    path('api/usuarios/', include('mitiempo_enloderomi.api.urls')),

    # API de Servicios
    path('api/', include('servicio.urls')),
    
    # API de Turnos
    path('api/', include('turno.urls')),

<<<<<<< HEAD
<<<<<<< HEAD
    path('api/productos/', include('productos.urls')),
=======
    path('api/', include('productos.urls')),

    # URLs de la app compras
    path('api/', include('compra.urls')),

    # Nueva ruta para caja_registro
    path('api/caja-registro/', include('caja_registro.urls')),
    
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    path('api/', include('productos.urls')),

    # URLs de la app compras
    path('api/', include('compras.urls')),
    
>>>>>>> 67ec8a26 (Producto terminado (Creo))
]