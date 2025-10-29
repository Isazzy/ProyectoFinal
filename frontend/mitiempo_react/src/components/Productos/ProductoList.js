import { useEffect, useState } from "react";
import {getProductos, deleteProducto, createProducto, updateProducto} from "../../api/productos";
import { Link } from "react-router-dom";

function ProductoList() {
  const [productos, setProductos] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getProductos("/productos/").then((res) => setProductos(res.data));
  }, []);

  // Filtrado simple local por nombre/tipo
  const filtered = productos.filter(
    (p) =>
      p.nombre_prod.toLowerCase().includes(query.toLowerCase()) ||
      p.tipo_prod.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h2>Inventario</h2>
      <Link to="/admin/dashboard/productos/create" className="btn btn-success mb-3">
        Agregar Producto
      </Link>
      <input
        className="form-control mb-2"
        placeholder="Buscar nombre/tipo"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio Venta</th>
            <th>Precio Compra</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id_prod}>
              <td>{p.nombre_prod}</td>
              <td>{p.tipo_prod}</td>
              <td>${p.precio_venta}</td>
              <td>${p.precio_compra}</td>
              <td>{p.stock_act_prod}</td>
              <td>
                <Link to={`/admin/dashboard/productos/edit/${p.id_prod}`} className="btn btn-warning btn-sm">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductoList;
