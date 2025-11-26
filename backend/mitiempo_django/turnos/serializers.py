from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import Turno, TurnoServicio
from servicio.models import Servicio

User = get_user_model()


# ----------------------------------------------------------
# TURNO SERVICIO
# ----------------------------------------------------------
class TurnoServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)
    servicio_precio = serializers.DecimalField(source='servicio.precio', max_digits=9, decimal_places=2, read_only=True)

    class Meta:
        model = TurnoServicio
        fields = [
            'id_turno_servicio', 'servicio',
            'servicio_nombre', 'duracion_servicio', 'servicio_precio'
        ]
        read_only_fields = ['servicio_nombre', 'servicio_precio']


# ----------------------------------------------------------
# LISTA DE TURNOS (ADMIN / CLIENTE)
# ----------------------------------------------------------
class TurnoListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_turno', read_only=True)
    cliente = serializers.StringRelatedField()
    cliente_id = serializers.SerializerMethodField()
    servicios = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    estado_pago = serializers.CharField(read_only=True)
    comprobante_url = serializers.SerializerMethodField()
    fecha_pago = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id', 'cliente', 'cliente_id',
            'fecha_hora_inicio', 'fecha_hora_fin',
            'estado', 'estado_pago', 'fecha_pago',
            'comprobante_url', 'servicios'
        ]

    def get_comprobante_url(self, obj):
        return obj.comprobante_pago.url if obj.comprobante_pago else None

    def get_servicios(self, obj):
        return [
            {
                'id': ts.servicio.id_serv,
                'nombre': ts.servicio.nombre,
                'duracion_servicio': ts.duracion_servicio,
                'precio': ts.servicio.precio
            }
            for ts in obj.servicios_asignados.select_related('servicio').all()
        ]

    def get_cliente_id(self, obj):
        return getattr(getattr(obj.cliente, 'cliente', None), 'id', None)


# ----------------------------------------------------------
# DETALLE DE TURNO
# ----------------------------------------------------------
class TurnoDetailSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_turno', read_only=True)
    cliente = serializers.StringRelatedField()
    cliente_id = serializers.SerializerMethodField()
    cliente_telefono = serializers.SerializerMethodField()
    servicios = serializers.SerializerMethodField()
    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    estado_pago = serializers.CharField(read_only=True)
    comprobante_url = serializers.SerializerMethodField()
    fecha_pago = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id', 'cliente', 'cliente_id', 'cliente_telefono',
            'fecha_hora_inicio', 'fecha_hora_fin', 'estado',
            'observaciones', 'estado_pago', 'comprobante_url',
            'fecha_pago', 'servicios'
        ]

    def get_comprobante_url(self, obj):
        return obj.comprobante_pago.url if obj.comprobante_pago else None

    def get_servicios(self, obj):
        return [
            {
                'id': ts.servicio.id_serv,
                'nombre': ts.servicio.nombre,
                'duracion_servicio': ts.duracion_servicio,
                'precio': ts.servicio.precio
            }
            for ts in obj.servicios_asignados.select_related('servicio').all()
        ]

    def get_cliente_telefono(self, obj):
        return getattr(getattr(obj.cliente, 'cliente', None), 'telefono', '')

    def get_cliente_id(self, obj):
        return getattr(getattr(obj.cliente, 'cliente', None), 'id', None)


# ----------------------------------------------------------
# CREAR TURNO
# ----------------------------------------------------------
class TurnoCreateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_turno', read_only=True)
    servicios = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    cliente = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    fecha_hora_fin = serializers.DateTimeField(read_only=True)

    comprobante_url = serializers.SerializerMethodField()
    estado_pago = serializers.CharField(read_only=True)
    fecha_pago = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id', 'cliente',
            'fecha_hora_inicio', 'fecha_hora_fin',
            'observaciones', 'estado',
            'estado_pago', 'fecha_pago', 'comprobante_url',
            'servicios'
        ]

    def get_comprobante_url(self, obj):
        return obj.comprobante_pago.url if obj.comprobante_pago else None

    # VALIDACIÓN DE SERVICIOS
    def validate(self, data):
        s_ids = data.get('servicios', [])
        qs = Servicio.objects.filter(id_serv__in=s_ids, activo=True)
        if qs.count() != len(set(s_ids)):
            raise serializers.ValidationError("Servicios inválidos o inactivos.")
        return data

    # CREATE
    def create(self, validated_data):
        from django.db import IntegrityError

        s_ids = validated_data.pop('servicios')
        request = self.context.get('request')

        cliente = validated_data.pop('cliente', None)
        if not cliente and request:
            cliente = request.user

        try:
            with transaction.atomic():
                turno = Turno.objects.create(
                    cliente=cliente,
                    fecha_hora_inicio=validated_data.get('fecha_hora_inicio'),
                    estado='pendiente',
                    observaciones=validated_data.get('observaciones', '')
                )

                # Agregar servicios
                detalles = []
                for sid in s_ids:
                    serv = Servicio.objects.get(id_serv=sid)
                    detalles.append(
                        TurnoServicio(
                            turno=turno, servicio=serv,
                            duracion_servicio=serv.duracion
                        )
                    )
                TurnoServicio.objects.bulk_create(detalles)

                return turno

        except IntegrityError:
            raise serializers.ValidationError({
                "error": "El turno ya fue reservado por otro cliente."
            })


# ----------------------------------------------------------
# UPDATE
# ----------------------------------------------------------
class TurnoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = [
            'estado', 'observaciones',
            'estado_pago'
        ]
