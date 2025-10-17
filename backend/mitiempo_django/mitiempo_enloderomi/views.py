from rest_framework import viewsets, filters  # Importa ViewSets y filtros de DRF.
from .models import Productos  # Importa el modelo Productos.
from .serializers import ProductosSerializer  # Importa el serializador.

class ProductosViewSet(viewsets.ModelViewSet):
    # Línea 1: Importa los módulos necesarios.
    
    queryset = Productos.objects.all()  # Línea 2: Define el conjunto de datos base.
    
    serializer_class = ProductosSerializer  # Línea 3: Asocia el serializador.
    
    filter_backends = [filters.SearchFilter]  # Línea 4: Habilita el filtro de búsqueda.
    search_fields = ['nombre_prod', 'tipo_prod']  # Línea 5: Especifica los campos en los que se puede buscar (e.g., ?search=producto1 para filtrar por nombre, o ?search=tipoA para filtrar por tipo_prod).
    
    # Este ViewSet maneja las operaciones CRUD:
    # - GET /api/productos/ : Lista productos, con opción de filtrar (e.g., ?search=nombre).
    # - GET /api/productos/{id_prod}/ : Obtiene un producto específico.
    # - POST /api/productos/ : Crea un nuevo producto.
    # - PUT /api/productos/{id_prod}/ : Actualiza un producto (e.g., para editar stock_act_prod manualmente).
    # - DELETE /api/productos/{id_prod}/ : Elimina un producto.
    
    # Ejemplo de uso: Para actualizar stock, envía un PUT con datos como {"stock_act_prod": 10}. El validador en el serializador verificará que no sea negativo.