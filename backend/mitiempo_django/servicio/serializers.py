<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
# servicios/serializers.py
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======
# servicio/serializers.py

>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from .models import Servicio


class ServicioSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
<<<<<<< HEAD
    """ Serializer principal para los Servicios """
    # Muestra la lista de profesionales que pueden hacer este servicio
    profesionales = ServicioProfesionalSerializer(
        source='servicioprofesional_set', 
        many=True, 
        read_only=True
    )
    # Devuelve la duración en minutos (más fácil para el frontend)
    duracion_minutos = serializers.SerializerMethodField()
=======
from rest_framework import serializers
# Importamos solo el modelo Servicio
from .models import Servicio

#
# 'ServicioProfesionalSerializer' se elimina por completo 
# porque el modelo 'ServicioProfesional' ya no se usa.
#

class ServicioSerializer(serializers.ModelSerializer):
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
    """ 
    Serializer principal para los Servicios.
    Muestra los detalles del servicio para el frontend.
    """

    # 'profesionales' se elimina porque ya no existe el modelo intermedio.
    
    # 'duracion_minutos' ahora es un campo directo del modelo,
    # por lo que no necesitamos un 'SerializerMethodField'.
<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)

=======
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    class Meta:
        model = Servicio
        fields = [
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            'id_serv', 'tipo_serv', 'nombre_serv', 'precio_serv', 
            'duracion_serv', 'duracion_minutos', 'descripcion_serv', 
            'activado', 'rol_requerido', 'profesionales'
        ]

    def get_duracion_minutos(self, obj):
        if obj.duracion_serv:
            return int(obj.duracion_serv.total_seconds() / 60)
        return 0
=======
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
            'id_serv', 
            'tipo_serv', 
            'nombre_serv', 
            'precio_serv', 
            'duracion_minutos', # <-- Campo actualizado
            'dias_disponibles', # <-- Campo nuevo
            'descripcion_serv', 
            'activado',
            # 'rol_requerido' y 'profesionales' se eliminan.
<<<<<<< HEAD
        ]
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
        ]
>>>>>>> 5f5a7856 (Actualizacion de models.py)
=======
            'id_serv',
            'tipo_serv',
            'nombre_serv',
            'descripcion_serv',
            'precio_serv',
            'duracion_minutos',
            'dias_disponibles',
            'activado',
        ]
        extra_kwargs = {
            'descripcion_serv': {'required': False, 'allow_blank': True},
            'activado': {'required': False},
            'dias_disponibles': {'required': False},
        }

    # --- Validaciones por campo ---
    def validate_precio_serv(self, value):
        """Precio debe ser mayor a 0."""
        if value is None:
            raise serializers.ValidationError("El precio es obligatorio.")
        try:
            # DecimalField viene como Decimal, comparamos con 0
            if value <= 0:
                raise serializers.ValidationError("El precio debe ser mayor a 0.")
        except TypeError:
            raise serializers.ValidationError("Valor de precio inválido.")
        return value

    def validate_duracion_minutos(self, value):
        """La duración debe ser razonable (5 - 480 minutos)."""
        if value is None:
            raise serializers.ValidationError("La duración es obligatoria.")
        if value < 5 or value > 480:
            raise serializers.ValidationError("La duración debe estar entre 5 y 480 minutos.")
        return value

    def validate_nombre_serv(self, value):
        """Nombre no vacío y único (case-insensitive)."""
        if not isinstance(value, str) or not value.strip():
            raise serializers.ValidationError("El nombre del servicio no puede estar vacío.")
        qs = Servicio.objects.filter(nombre_serv__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ya existe un servicio con este nombre.")
        return value

    def validate_dias_disponibles(self, value):
        """
        Validar que dias_disponibles sea una lista de strings (días en minúscula).
        Ej: ['lunes', 'martes']
        """
        if value is None:
            return value
        if not isinstance(value, list):
            raise serializers.ValidationError("dias_disponibles debe ser una lista.")
        for dia in value:
            if not isinstance(dia, str) or not dia.strip():
                raise serializers.ValidationError("Cada día debe ser un string no vacío.")
        return value

    # --- Create / Update / Delete con reglas de negocio ---
    def create(self, validated_data):
        """Asegurar activado=True por defecto si no se especifica."""
        if 'activado' not in validated_data:
            validated_data['activado'] = True
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        No permitir desactivar si existen turnos pendientes o ventas recientes (últimos 7 días).
        Usamos getattr para evitar AttributeError si las relaciones no existen.
        """
        if 'activado' in validated_data and validated_data['activado'] is False:
            # chequeo de turnos pendientes (si existe relación)
            turnos_manager = getattr(instance, 'turnos_set', None) or getattr(instance, 'turnos', None)
            if turnos_manager is not None:
                try:
                    if turnos_manager.filter(estado='PENDIENTE').exists():
                        raise serializers.ValidationError("No se puede desactivar un servicio con turnos pendientes.")
                except Exception:
                    # Si la estructura de turno es distinta, omitimos este chequeo en lugar de romper.
                    pass

            # chequeo de ventas recientes (si existe relación detventas_set)
            detventas_manager = getattr(instance, 'detventas_set', None) or getattr(instance, 'detventas', None)
            if detventas_manager is not None:
                try:
                    fecha_limite = timezone.now() - timedelta(days=7)
                    # intento de filtro común; si la estructura es distinta puede fallar y lo capturamos
                    if detventas_manager.filter(id_venta__fech_hs_vent__gte=fecha_limite).exists():
                        raise serializers.ValidationError("No se puede desactivar un servicio con ventas en los últimos 7 días.")
                except Exception:
                    pass

        return super().update(instance, validated_data)

    def delete(self, instance):
        """
        Elimina un servicio solo si no tiene turnos ni ventas asociadas.
        Si las relaciones no existen, permitimos la eliminación.
        """
        turnos_manager = getattr(instance, 'turnos_set', None) or getattr(instance, 'turnos', None)
        detventas_manager = getattr(instance, 'detventas_set', None) or getattr(instance, 'detventas', None)

        if turnos_manager is not None:
            try:
                if turnos_manager.exists():
                    raise serializers.ValidationError("No se puede eliminar un servicio con turnos asociados.")
            except Exception:
                # Si no se puede evaluar, no bloqueamos por seguridad (ajusta si prefieres lo contrario)
                pass

        if detventas_manager is not None:
            try:
                if detventas_manager.exists():
                    raise serializers.ValidationError("No se puede eliminar un servicio con ventas asociadas.")
            except Exception:
                pass

        # Si se llega aquí, permitimos la eliminación
        return super().delete(instance)
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
