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
            # No hay caja abierta → sugerir monto (opcional para el frontend)
            # pero NO forzarlo al guardar
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
        # 1. Validar que no haya otra abierta
        if Caja.objects.filter(caja_estado=True).exists():
            raise serializers.ValidationError("Ya hay una caja abierta. Cierre la actual antes de abrir una nueva.")

        if not hasattr(self.request.user, "empleado"):
            raise serializers.ValidationError("El usuario actual no tiene un perfil de empleado asociado.")

        empleado = self.request.user.empleado

        # 2. CORRECCIÓN: Usar el monto que envía el usuario
        # Antes: Se buscaba la última caja y se sobreescribía.
        # Ahora: Respetamos lo que viene del formulario.
        monto_inicial = serializer.validated_data.get("caja_monto_inicial")
        
        if monto_inicial is None:
             monto_inicial = Decimal("0.00")

        # Guardamos la caja nueva con el monto ingresado y saldo final inicializado igual
        serializer.save(
            empleado=empleado, 
            caja_monto_inicial=monto_inicial,
            caja_saldo_final=monto_inicial # El saldo inicial también es el saldo actual al momento de abrir
        )


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
            # Caso de borde: cerrar la más reciente si hay error de múltiples cajas
            return self.get_queryset().latest('caja_fecha_hora_apertura')
        



        # Al inicio del archivo ya tienes imports; añade:
from rest_framework.views import APIView
from django.db.models import Sum, Q
from datetime import date, timedelta, datetime

class ReporteIngresosEgresos(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _parse_date_range(self, request):
        # Prioriza params explicitos: desde / hasta (YYYY-MM-DD), sino dias
        desde = request.query_params.get('desde')
        hasta = request.query_params.get('hasta')
        dias = request.query_params.get('dias')

        if desde and hasta:
            try:
                d_desde = datetime.strptime(desde, "%Y-%m-%d").date()
                d_hasta = datetime.strptime(hasta, "%Y-%m-%d").date()
                return d_desde, d_hasta
            except Exception:
                pass

        try:
            dias = int(dias) if dias is not None else 30
        except Exception:
            dias = 30

        hoy = date.today()
        inicio = hoy - timedelta(days=dias)
        return inicio, hoy

    def get(self, request):
        # Opcional: filtrar por caja
        caja_id = request.query_params.get('caja_id', None)
        caja_filter = {}
        if caja_id:
            caja_filter = {'caja__id': caja_id}
        else:
            # si quieres limitar por caja abierta: comentar si no hace falta
            # caja_abierta = Caja.objects.filter(caja_estado=True).first()
            # if caja_abierta:
            #     caja_filter = {'caja': caja_abierta}
            caja_filter = {}

        inicio, hasta = self._parse_date_range(request)

        # INGRESOS manuales
        ingresos_manuales_qs = Ingreso.objects.filter(
            ingreso_fecha__range=[inicio, hasta],
            **caja_filter
        ).aggregate(total=Sum('ingreso_monto'))
        ingresos_manuales = ingresos_manuales_qs['total'] or 0

        # INGRESOS por VENTAS pagadas
        ventas_qs = Venta.objects.filter(
            venta_fecha_hora__date__range=[inicio, hasta],
            estado_venta__estado_venta_nombre='Pagado',
            **caja_filter
        ).aggregate(total=Sum('venta_total'))
        ingresos_ventas = ventas_qs['total'] or 0

        # EGRESOS manuales
        egresos_manuales_qs = Egreso.objects.filter(
            egreso_fecha__range=[inicio, hasta],
            **caja_filter
        ).aggregate(total=Sum('egreso_monto'))
        egresos_manuales = egresos_manuales_qs['total'] or 0

        # EGRESOS por COMPRAS
        compras_qs = Compra.objects.filter(
            compra_fecha__range=[inicio, hasta],
            **caja_filter
        ).aggregate(total=Sum('compra_total'))
        egresos_compras = compras_qs['total'] or 0

        ingresos_total = float(ingresos_manuales + ingresos_ventas)
        egresos_total = float(egresos_manuales + egresos_compras)

        return Response({
            "desde": str(inicio),
            "hasta": str(hasta),
            "ingresos": ingresos_total,
            "egresos": egresos_total,
            "detalle": {
                "ingresos_manuales": float(ingresos_manuales),
                "ingresos_ventas": float(ingresos_ventas),
                "egresos_manuales": float(egresos_manuales),
                "egresos_compras": float(egresos_compras)
            }
        })
