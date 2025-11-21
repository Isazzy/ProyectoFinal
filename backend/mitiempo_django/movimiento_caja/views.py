from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from .models import Ingreso, Egreso
from .serializers import (
    IngresoSerializer, 
    EgresoSerializer, 
    MovimientoConsolidadoSerializer
)
from caja.models import Caja
from ventas.models import Venta
from compras.models import Compra

class BaseMovimientoView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_caja(self):
        caja_id = self.request.query_params.get('caja_id', None)
        try:
            if caja_id:
                return Caja.objects.get(id=caja_id)
            else:
                return Caja.objects.get(caja_estado=True)
        except Caja.DoesNotExist:
            raise serializers.ValidationError("No se encontró la caja solicitada o no hay ninguna caja abierta.")
        except Caja.MultipleObjectsReturned:
            raise serializers.ValidationError("Error: Hay múltiples cajas abiertas. Cierre las cajas anteriores.")

    def perform_create(self, serializer):
        caja_abierta = self.get_caja()
        if not caja_abierta.caja_estado:
            raise serializers.ValidationError("No se pueden registrar movimientos en una caja cerrada.")
        serializer.save(caja=caja_abierta)

    def list(self, request, *args, **kwargs):
        try:
            caja = self.get_caja()
        except serializers.ValidationError as e:
            return Response([], status=200)

        movimientos_combinados = self.get_movimientos_combinados(caja)
        movimientos_ordenados = sorted(movimientos_combinados, key=lambda x: x['fecha'], reverse=True)
        serializer = MovimientoConsolidadoSerializer(movimientos_ordenados, many=True)
        return Response(serializer.data)

    def get_movimientos_combinados(self, caja):
        raise NotImplementedError("Subclase debe implementar get_movimientos_combinados")


class IngresoCreateListView(BaseMovimientoView):
    queryset = Ingreso.objects.all()
    serializer_class = IngresoSerializer # Usado solo para POST

    def get_movimientos_combinados(self, caja):
        # 1. Ingresos manuales
        ingresos = Ingreso.objects.filter(caja=caja).values(
            'id', 'ingreso_fecha_hora', 'ingreso_descripcion', 'ingreso_monto'
        )
        lista_ingresos = [
            {
                'id': i['id'], 'tipo': 'Ingreso', 'fecha': i['ingreso_fecha_hora'],
                'descripcion': i['ingreso_descripcion'], 'monto': i['ingreso_monto']
            } for i in ingresos
        ]
        
        # 2. Ventas (Pagadas - Efectivo Y Transferencia)
        ventas = Venta.objects.filter(
            caja=caja,
            estado_venta__estado_venta_nombre='Pagado' # <-- CORREGIDO
        ).values(
            'id', 'venta_fecha_hora', 'venta_total', 'venta_medio_pago'
        )
        
        lista_ventas = [
            {
                'id': v['id'], 'tipo': 'Venta', 'fecha': v['venta_fecha_hora'],
                'descripcion': f"Venta N°{v['id']} ({v['venta_medio_pago']})", 
                'monto': v['venta_total']
            } for v in ventas
        ]
        
        return lista_ingresos + lista_ventas


class EgresoCreateListView(BaseMovimientoView):
    queryset = Egreso.objects.all()
    serializer_class = EgresoSerializer # Usado solo para POST
    
    def get_movimientos_combinados(self, caja):
        # 1. Egresos manuales
        egresos = Egreso.objects.filter(caja=caja).values(
            'id', 'egreso_fecha_hora', 'egreso_descripcion', 'egreso_monto'
        )
        lista_egresos = [
            {
                'id': e['id'], 'tipo': 'Egreso', 'fecha': e['egreso_fecha_hora'],
                'descripcion': e['egreso_descripcion'], 'monto': e['egreso_monto']
            } for e in egresos
        ]
        
        # 2. Compras (Efectivo Y Transferencia)
        compras = Compra.objects.filter(
            caja=caja
        ).values(
            'id', 'compra_fecha_hora', 'compra_total', 
            'proveedor__proveedor_nombre', 'compra_metodo_pago'
        )
        lista_compras = [
            {
                'id': c['id'], 'tipo': 'Compra', 'fecha': c['compra_fecha_hora'],
                'descripcion': f"Compra a {c['proveedor__proveedor_nombre']} ({c['compra_metodo_pago']})",
                'monto': c['compra_total']
            } for c in compras
        ]
        
        return lista_egresos + lista_compras