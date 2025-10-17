from rest_framework import serializers
from .models import Productos  # Importa el modelo Productos de tu archivo models.py.
class ProductosSerializer(serializers.ModelSerializer):
    # Línea 1: Importa serializers de DRF y el modelo Productos.
    
    def validate_stock_act_prod(self, value):
        # Línea 2: Define un método de validación personalizado para el campo stock_act_prod.
        # Esto se ejecuta durante la creación o actualización de un producto.
        if value < 0:
            # Línea 3: Si el valor es negativo, levanta un error de validación.
            raise serializers.ValidationError("La cantidad en stock no puede ser negativa.")
        return value  # Línea 4: Si es válido, devuelve el valor.
    
    class Meta:
        # Línea 5: Define una clase interna Meta para configurar el serializador.
        model = Productos  # Línea 6: Especifica que este serializador se basa en el modelo Productos.
        fields = '__all__'  # Línea 7: Serializa todos los campos. Puedes restringir si es necesario.
