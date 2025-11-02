<<<<<<< HEAD
<<<<<<< HEAD
# servicios/serializers.py
=======
>>>>>>> 5f5a7856 (Actualizacion de models.py)
from rest_framework import serializers
# Importamos solo el modelo Servicio
from .models import Servicio

#
# 'ServicioProfesionalSerializer' se elimina por completo 
# porque el modelo 'ServicioProfesional' ya no se usa.
#

class ServicioSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = Servicio
        # Actualizamos los campos para que coincidan con el modelo
        fields = [
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
