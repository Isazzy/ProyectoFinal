from rest_framework import generics, permissions, viewsets
from .serializers import RegisterSerializer, UserCRUDSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAdminUser

User = get_user_model()


# ✅ Login con JWT personalizado (usa email y devuelve rol)
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ✅ Registro
class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ✅ CRUD de usuarios (solo admin)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserCRUDSerializer
    permission_classes = [IsAdminUser]
