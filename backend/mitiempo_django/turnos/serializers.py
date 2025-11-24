from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import Turno, TurnoServicio
from servicio.models import Servicio

User = get_user_model()

class TurnoServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)
    servicio_precio = serializers.DecimalField(source='servicio.precio', max_digits=9, decimal_places=2, read_only=True)

    class Meta:
        model = TurnoServicio
        fields = ['id_turno_servicio', 'servicio', 'servicio_nombre', 'duracion_servicio', 'servicio_precio']
        read_only_fields = ['servicio_nombre', 'servicio_precio']

class TurnoListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_turno', read_only=True)
    cliente = serializers.StringRelatedField() # Muestra el nombre del usuario/cliente
    
    # CORRECCIÓN: Obtenemos el ID del Perfil Cliente de forma segura
    cliente_id = serializers.SerializerMethodField()
    
    servicios = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = ['id', 'cliente', 'cliente_id', 'fecha_hora_inicio', 'fecha_hora_fin', 'estado', 'servicios']

    def get_servicios(self, obj):
        return [{
            'id': ts.servicio.id_serv,
            'nombre': ts.servicio.nombre,
            'duracion_servicio': ts.duracion_servicio,
            'precio': ts.servicio.precio
        } for ts in obj.servicios_asignados.select_related('servicio').all()]

    def get_cliente_id(self, obj):
        # Busca si el Usuario tiene un perfil Cliente asociado
        if hasattr(obj.cliente, 'cliente') and obj.cliente.cliente:
            return obj.cliente.cliente.id
        return None
    def get_venta_id(self, obj):
        # Buscamos si existe una venta NO anulada asociada a este turno
        # Asumiendo que tienes related_name='ventas' o venta_set en el modelo Turno -> Venta
        # O buscamos en Venta filtrando por turno
        from ventas.models import Venta
        venta = Venta.objects.filter(turno=obj).exclude(estado_venta__estado_venta_nombre='Anulado').first()
        return venta.id if venta else None

class TurnoDetailSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_turno', read_only=True)
    cliente = serializers.StringRelatedField()
    
    # CORRECCIÓN: Obtenemos el ID del Perfil Cliente de forma segura
    cliente_id = serializers.SerializerMethodField()
    
    cliente_telefono = serializers.SerializerMethodField()
    servicios = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = ['id', 'cliente', 'cliente_id', 'cliente_telefono', 'fecha_hora_inicio', 'fecha_hora_fin', 'estado', 'observaciones', 'servicios']

    def get_servicios(self, obj):
        return [{
            'id': ts.servicio.id_serv,
            'nombre': ts.servicio.nombre,
            'duracion_servicio': ts.duracion_servicio,
            'precio': ts.servicio.precio
        } for ts in obj.servicios_asignados.select_related('servicio').all()]

    def get_cliente_telefono(self, obj):
        if hasattr(obj.cliente, 'cliente') and obj.cliente.cliente:
            return obj.cliente.cliente.telefono
        return ''

    def get_cliente_id(self, obj):
        # Accede al perfil 'cliente' vinculado al usuario (OneToOne)
        if hasattr(obj.cliente, 'cliente') and obj.cliente.cliente:
            return obj.cliente.cliente.id
        return None

class TurnoCreateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_turno', read_only=True)
    servicios = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    cliente = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = ['id', 'cliente', 'fecha_hora_inicio', 'fecha_hora_fin', 'observaciones', 'servicios']

    def validate(self, data):
        s_ids = data.get('servicios', [])
        if not s_ids: raise serializers.ValidationError("Faltan servicios.")
        
        qs = Servicio.objects.filter(id_serv__in=s_ids, activo=True)
        if qs.count() != len(set(s_ids)):
            raise serializers.ValidationError("Servicios inválidos o inactivos.")
        return data

    def create(self, validated_data):
        s_ids = validated_data.pop('servicios')
        request = self.context.get('request')
        
        cliente = validated_data.pop('cliente', None)

        if not cliente:
            if request and request.user.is_staff:
                raise serializers.ValidationError({"cliente": "Como administrador, debe seleccionar un cliente válido."})
            elif request:
                cliente = request.user

        with transaction.atomic():
            turno = Turno.objects.create(
                cliente=cliente,
                fecha_hora_inicio=validated_data.get('fecha_hora_inicio'),
                estado='pendiente',
                observaciones=validated_data.get('observaciones', '')
            )
            detalles = []
            for sid in s_ids:
                serv = Servicio.objects.get(id_serv=sid)
                detalles.append(TurnoServicio(
                    turno=turno, 
                    servicio=serv, 
                    duracion_servicio=serv.duracion 
                ))
            TurnoServicio.objects.bulk_create(detalles)
            return turno

class TurnoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = ['estado', 'observaciones']