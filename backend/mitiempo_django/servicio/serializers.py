from rest_framework import serializers
# Importamos solo el modelo Servicio
from .models import Servicio

#
# 'ServicioProfesionalSerializer' se elimina por completo 
# porque el modelo 'ServicioProfesional' ya no se usa.
#

class ServicioSerializer(serializers.ModelSerializer):
    """ 
    Serializer principal para los Servicios.
    Muestra los detalles del servicio para el frontend.
    """

    # 'profesionales' se elimina porque ya no existe el modelo intermedio.
    
    # 'duracion_minutos' ahora es un campo directo del modelo,
    # por lo que no necesitamos un 'SerializerMethodField'.

    class Meta:
        model = Servicio
        # Actualizamos los campos para que coincidan con el modelo
        fields = [
            'id_serv', 
            'tipo_serv', 
            'nombre_serv', 
            'precio_serv', 
            'duracion_minutos', # <-- Campo actualizado
            'dias_disponibles', # <-- Campo nuevo
            'descripcion_serv', 
            'activado',
            # 'rol_requerido' y 'profesionales' se eliminan.
        ]