import React, { useState, useEffect } from 'react';
// Importamos las funciones de nuestro servicio
import { getProductos, deleteProducto } from '../../api/productos'; // Ajusta esta ruta

function ProductList() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para cargar datos cuando el componente se monta
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      // 1. Llamamos a la API usando nuestro servicio
      const response = await getProductos();
      setProductos(response.data);
    } catch (err) {
      // El interceptor de axios ya manejó el 401 (refresh/redirect)
      // Esto capturará otros errores (ej. 404, 500)
      setError("No se pudieron cargar los productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Pedimos confirmación
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        // 2. Llamamos a la API para borrar
        await deleteProducto(id);
        // 3. Actualizamos el estado local para reflejar el cambio
        setProductos(productos.filter(p => p.id_prod !== id));
      } catch (err) {
        setError("Error al eliminar el producto.");
        console.error(err);
      }
    }
  };

  // --- Renderizado ---

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h2>Gestión de Productos</h2>
      {/* Aquí iría un botón para "Crear Nuevo" que lleve a un formulario */}
      <button>Crear Producto</button>
      
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Stock Actual</th>
            <th>Precio Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod.id_prod}>
              <td>{prod.nombre_prod}</td>
              {/* Mostramos el nombre de la marca (si existe) */}
              <td>{prod.marca ? prod.marca.nombre : 'N/A'}</td>
              <td>{prod.categoria ? prod.categoria.nombre : 'N/A'}</td>
              <td>{prod.stock_act_prod}</td>
              <td>${prod.precio_venta}</td>
              <td>
                {/* Aquí irían botones para Editar y Ajustar Stock */}
                <button>Editar</button>
                <button onClick={() => handleDelete(prod.id_prod)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;