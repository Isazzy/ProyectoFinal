from rest_framework.routers import DefaultRouter
from mitiempo_enloderomi.api.views import UsuariosViewSet

router = DefaultRouter()
router.register("usuarios", UsuariosViewSet, basename="usuarios")
urlpatterns = router.urls
