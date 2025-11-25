from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from datetime import datetime, time
from .models import Ingreso, Egreso
from .serializers import (
    IngresoSerializer, 
    EgresoSerializer, 
    MovimientoConsolidadoSerializer
)
from caja.models import Caja
from ventas.models import Venta
from compras.models import Compra
from django.utils import timezone # <--- IMPORTANTE
from django.db import transaction

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
            return None # Manejo suave si no hay caja
        except Caja.MultipleObjectsReturned:
            raise serializers.ValidationError("Error: Múltiples cajas abiertas.")

    def perform_create(self, serializer):
        caja_abierta = self.get_caja()
        if not caja_abierta or not caja_abierta.caja_estado:
            raise serializers.ValidationError("No se pueden registrar movimientos: No hay caja abierta.")
        # El modelo se encarga de poner fecha/hora actual
        serializer.save(caja=caja_abierta)

    def list(self, request, *args, **kwargs):
        caja = self.get_caja()
        if not caja:
            return Response([])

        movimientos_combinados = self.get_movimientos_combinados(caja)
        
        # Ordenar descendente por fecha combinada
        movimientos_ordenados = sorted(
            movimientos_combinados, 
            key=lambda x: x['fecha'], 
            reverse=True
        )
        
        serializer = MovimientoConsolidadoSerializer(movimientos_ordenados, many=True)
        return Response(serializer.data)

    def get_movimientos_combinados(self, caja):
        raise NotImplementedError("Subclase debe implementar")


class IngresoCreateListView(BaseMovimientoView):
    queryset = Ingreso.objects.all()
    serializer_class = IngresoSerializer 

    def perform_create(self, serializer):
        caja_abierta = Caja.objects.filter(caja_estado=True).first()
        if not caja_abierta:
            raise serializers.ValidationError("No hay una caja abierta para registrar ingresos.")
        
        with transaction.atomic():
            # 1. Guardar el Movimiento
            instance = serializer.save(caja=caja_abierta)
            
            # 2. Actualizar Saldo de Caja (SUMAR)
            caja_abierta.caja_saldo_final = (caja_abierta.caja_saldo_final or 0) + instance.ingreso_monto
            caja_abierta.save()

    def get_movimientos_combinados(self, caja):
        # 1. Ingresos manuales (Fecha y Hora separadas)
        ingresos = Ingreso.objects.filter(caja=caja).values(
            'id', 'ingreso_fecha', 'ingreso_hora', 'ingreso_descripcion', 'ingreso_monto'
        )
        lista_ingresos = []
        for i in ingresos:
            dt_naive = datetime.combine(i['ingreso_fecha'], i['ingreso_hora'])
            dt_aware = timezone.make_aware(dt_naive)
            lista_ingresos.append({
                'id': i['id'], 'tipo': 'Ingreso', 'fecha': dt_aware,
                'descripcion': i['ingreso_descripcion'], 'monto': i['ingreso_monto']
            })
        
        # 2. Ventas (Pagadas) - Usa DateTimeField original
        ventas = Venta.objects.filter(
            caja=caja,
            estado_venta__estado_venta_nombre='Pagado'
        ).values('id', 'venta_fecha_hora', 'venta_total', 'venta_medio_pago')
        
        lista_ventas = [
            {
                'id': v['id'], 'tipo': 'Venta', 'fecha': v['venta_fecha_hora'],
                'descripcion': f"Venta #{v['id']} ({v['venta_medio_pago']})", 
                'monto': v['venta_total']
            } for v in ventas
        ]
        
        return lista_ingresos + lista_ventas


class EgresoCreateListView(BaseMovimientoView):
    queryset = Egreso.objects.all()
    serializer_class = EgresoSerializer

    def perform_create(self, serializer):
        caja_abierta = Caja.objects.filter(caja_estado=True).first()
        if not caja_abierta:
            raise serializers.ValidationError("No hay una caja abierta para registrar egresos.")
        
        with transaction.atomic():
            # 1. Guardar el Movimiento
            instance = serializer.save(caja=caja_abierta)
            
            # 2. Actualizar Saldo de Caja (RESTAR)
            caja_abierta.caja_saldo_final = (caja_abierta.caja_saldo_final or 0) - instance.egreso_monto
            caja_abierta.save()
    
    def get_movimientos_combinados(self, caja):
        # 1. Egresos manuales (Fecha y Hora separadas)
        egresos = Egreso.objects.filter(caja=caja).values(
            'id', 'egreso_fecha', 'egreso_hora', 'egreso_descripcion', 'egreso_monto'
        )
        lista_egresos = []
        for e in egresos:
            dt_naive = datetime.combine(e['egreso_fecha'], e['egreso_hora'])
            dt_aware = timezone.make_aware(dt_naive)
            lista_egresos.append({
                'id': e['id'], 'tipo': 'Egreso', 'fecha': dt_aware,
                'descripcion': e['egreso_descripcion'], 'monto': e['egreso_monto']
            })
        
        # 2. Compras (Fecha y Hora separadas)
        compras = Compra.objects.filter(caja=caja).values(
            'id', 'compra_fecha', 'compra_hora', 'compra_total', 
            'proveedor__proveedor_nombre', 'compra_metodo_pago'
        )
        lista_compras = []
        for c in compras:
            hora = c['compra_hora'] or time(0,0,0)
            dt_naive = datetime.combine(c['compra_fecha'], hora)
            dt_aware = timezone.make_aware(dt_naive)
            lista_compras.append({
                'id': c['id'], 'tipo': 'Compra', 'fecha': dt_aware,
                'descripcion': f"Compra a {c['proveedor__proveedor_nombre']} ({c['compra_metodo_pago']})",
                'monto': c['compra_total']
            })
        
        return lista_egresos + lista_compras
    
from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from datetime import datetime, time
from django.shortcuts import get_object_or_404

# Modelos
from .models import Ingreso, Egreso
from caja.models import Caja
from ventas.models import Venta
from compras.models import Compra

# Serializers
from .serializers import (
    IngresoSerializer, 
    EgresoSerializer, 
    MovimientoConsolidadoSerializer
)

# ... (Tus clases IngresoCreateListView y EgresoCreateListView se quedan igual) ...

# --- NUEVA VISTA PARA LA RUTA RAÍZ ---
class MovimientoConsolidadoListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Obtener la Caja
        caja_id = request.query_params.get('caja_id')
        if caja_id:
            caja = get_object_or_404(Caja, id=caja_id)
        else:
            caja = Caja.objects.filter(caja_estado=True).first()
            
        if not caja:
            return Response([], status=status.HTTP_200_OK)

        lista_movimientos = []

        # 2. Recopilar INGRESOS Manuales
        ingresos = Ingreso.objects.filter(caja=caja).values(
            'id', 'ingreso_fecha', 'ingreso_hora', 'ingreso_descripcion', 'ingreso_monto'
        )
        for i in ingresos:
            # CORRECCIÓN: Combinar y hacer Aware (con zona horaria)
            dt_naive = datetime.combine(i['ingreso_fecha'], i['ingreso_hora'])
            dt_aware = timezone.make_aware(dt_naive)
            
            lista_movimientos.append({
                'id': i['id'], 
                'tipo': 'Ingreso', 
                'fecha': dt_aware,
                'descripcion': i['ingreso_descripcion'], 
                'monto': i['ingreso_monto']
            })

        # 3. Recopilar EGRESOS Manuales
        egresos = Egreso.objects.filter(caja=caja).values(
            'id', 'egreso_fecha', 'egreso_hora', 'egreso_descripcion', 'egreso_monto'
        )
        for e in egresos:
            # CORRECCIÓN
            dt_naive = datetime.combine(e['egreso_fecha'], e['egreso_hora'])
            dt_aware = timezone.make_aware(dt_naive)

            lista_movimientos.append({
                'id': e['id'], 
                'tipo': 'Egreso', 
                'fecha': dt_aware,
                'descripcion': e['egreso_descripcion'], 
                'monto': e['egreso_monto']
            })

        # 4. Recopilar VENTAS (Pagadas)
        # Las ventas usan DateTimeField, Django ya las entrega Aware (con zona horaria)
        ventas = Venta.objects.filter(
            caja=caja,
            estado_venta__estado_venta_nombre='Pagado'
        ).values('id', 'venta_fecha_hora', 'venta_total', 'venta_medio_pago')
        
        for v in ventas:
            lista_movimientos.append({
                'id': v['id'], 
                'tipo': 'Venta', 
                'fecha': v['venta_fecha_hora'], # Ya es Aware
                'descripcion': f"Venta #{v['id']} ({v['venta_medio_pago']})", 
                'monto': v['venta_total']
            })

        # 5. Recopilar COMPRAS
        compras = Compra.objects.filter(caja=caja).values(
            'id', 'compra_fecha', 'compra_hora', 'compra_total', 
            'proveedor__proveedor_nombre', 'compra_metodo_pago'
        )
        for c in compras:
            hora = c['compra_hora'] or time(0,0,0)
            # CORRECCIÓN
            dt_naive = datetime.combine(c['compra_fecha'], hora)
            dt_aware = timezone.make_aware(dt_naive)

            lista_movimientos.append({
                'id': c['id'], 
                'tipo': 'Compra', 
                'fecha': dt_aware,
                'descripcion': f"Compra a {c['proveedor__proveedor_nombre']} ({c['compra_metodo_pago']})",
                'monto': c['compra_total']
            })

        # 6. Ordenar todo por fecha descendente
        # Ahora todas las fechas son Aware, por lo que la comparación funciona
        movimientos_ordenados = sorted(
            lista_movimientos, 
            key=lambda x: x['fecha'], 
            reverse=True
        )

        # 7. Serializar
        serializer = MovimientoConsolidadoSerializer(movimientos_ordenados, many=True)
        return Response(serializer.data)