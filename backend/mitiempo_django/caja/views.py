<<<<<<< HEAD
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Caja
from .serializers import CajaSerializer

class IsAdminOrEmpleado(permissions.BasePermission):
    """
    Permiso personalizado: Solo permite acceso a usuarios con role 'admin' o 'empleado'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'empleado']

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer
    permission_classes = [IsAdminOrEmpleado]  # Restringe a admins/empleados
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['caja_estado', 'caja_fecha_hora_apertura']  # Filtros por estado y fecha
    ordering_fields = ['caja_fecha_hora_apertura', 'caja_fecha_hora_cierre']
    ordering = ['-caja_fecha_hora_apertura']  # Orden por apertura descendente
    
    def get_queryset(self):
        """
        Filtra queryset: Admins ven todas las cajas; empleados solo las suyas.
        """
        user = self.request.user
        if user.role == 'admin':
            return Caja.objects.all()
        return Caja.objects.filter(usuario=user)
    
    def perform_create(self, serializer):
        """
        Al crear (abrir) caja, asigna automáticamente el usuario.
        """
        serializer.save(usuario=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='abrir')
    def abrir_caja(self, request):
        """
        Acción para abrir una nueva caja.
        - Verifica que el usuario no tenga una caja abierta.
        - Crea una nueva caja con estado abierto.
        """
        user = request.user
        
        # Verificar si ya tiene una caja abierta
        if Caja.objects.filter(usuario=user, caja_estado=True).exists():
            return Response(
                {"error": "Ya tienes una caja abierta. Cierra la anterior antes de abrir una nueva."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear la caja con datos del request (e.g., monto inicial)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            caja = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='cerrar')
    def cerrar_caja(self, request, pk=None):
        """
        Acción para cerrar una caja existente.
        - Verifica permisos (solo el usuario asignado o admin).
        - Calcula el saldo final basado en transacciones de caja_registro.
        - Actualiza la caja y la marca como cerrada.
        """
        caja = self.get_object()
        user = request.user
        
        # Verificar permisos
        if caja.usuario != user and user.role != 'admin':
            return Response({"error": "No tienes permisos para cerrar esta caja."}, status=status.HTTP_403_FORBIDDEN)
        
        # Verificar que esté abierta
        if not caja.caja_estado:
            return Response({"error": "La caja ya está cerrada."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener saldo final del request o calcularlo
        saldo_final = request.data.get('caja_saldo_final')
        if saldo_final is None:
            # Usar el saldo calculado del serializer
            serializer = self.get_serializer(caja)
            saldo_final = serializer.get_saldo_calculado(caja)
        
        # Cerrar la caja usando el método del modelo
        try:
            caja.cerrar_caja(saldo_final=saldo_final, observacion=request.data.get('caja_observacion'))
            serializer = self.get_serializer(caja)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='abiertas')
    def cajas_abiertas(self, request):
        """
        Endpoint para listar solo cajas abiertas (útil para dashboards).
        """
        cajas = self.get_queryset().filter(caja_estado=True)
        serializer = self.get_serializer(cajas, many=True)
        return Response(serializer.data)
=======
# caja/views.py
from rest_framework import generics, permissions, status, views, serializers
from rest_framework.response import Response
from decimal import Decimal
from .models import Caja
from .serializers import CajaListSerializer, CajaCreateSerializer, CajaCloseSerializer


class CajaHistoryView(generics.ListAPIView):
    queryset = Caja.objects.select_related("empleado__user").order_by("-caja_fecha_hora_apertura")
    serializer_class = CajaListSerializer
    permission_classes = [permissions.IsAuthenticated]


class CajaStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Si hay una caja abierta → devolverla
        try:
            caja_abierta = Caja.objects.get(caja_estado=True)
            return Response(CajaListSerializer(caja_abierta).data, status=200)

        except Caja.DoesNotExist:
            # No hay caja abierta → sugerir monto según la última cerrada
            try:
                ultima = Caja.objects.filter(caja_estado=False).latest("caja_fecha_hora_cierre")
                sugerido = ultima.caja_saldo_final
            except Caja.DoesNotExist:
                sugerido = Decimal("0.00")

            return Response({
                "caja_estado": False,
                "detail": "No hay ninguna caja abierta.",
                "monto_sugerido_apertura": sugerido
            })


class AbrirCajaView(generics.CreateAPIView):
    queryset = Caja.objects.none()
    serializer_class = CajaCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if Caja.objects.filter(caja_estado=True).exists():
            raise serializers.ValidationError("Ya hay una caja abierta.")

        if not hasattr(self.request.user, "empleado"):
            raise serializers.ValidationError("Usuario no asociado a empleado.")

        empleado = self.request.user.empleado

        # Determinar monto inicial
        try:
            ultima = Caja.objects.filter(caja_estado=False).latest("caja_fecha_hora_cierre")
            monto_inicial = ultima.caja_saldo_final
        except Caja.DoesNotExist:
            monto_inicial = serializer.validated_data.get("caja_monto_inicial", Decimal("0.00"))

        serializer.save(empleado=empleado, caja_monto_inicial=monto_inicial)

class CerrarCajaView(generics.UpdateAPIView):
    queryset = Caja.objects.filter(caja_estado=True)
    serializer_class = CajaCloseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.get_queryset().get()
        except Caja.DoesNotExist:
            raise serializers.ValidationError("No hay ninguna caja abierta para cerrar.")
        except Caja.MultipleObjectsReturned:
            raise serializers.ValidationError("Error: Hay múltiples cajas abiertas. Cierrelas manualmente.")
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
