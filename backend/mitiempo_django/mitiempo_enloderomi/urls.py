#/backend/mitiempo_django/mitiempo_enloderomi/urls.py
from django.urls import path, include

urlpatterns = [
    path("", include("mitiempo_enloderomi.api.urls")),  #  esto conecta el router
    path('api/', include('productos.urls')),

]
