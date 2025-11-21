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