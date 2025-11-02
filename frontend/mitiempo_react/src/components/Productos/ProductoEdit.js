import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {updateProducto,getProductos} from "../../api/productos";

function ProductoEdit() {
  const { id } = useParams();
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getProductos(`/productos/${id}/`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProducto(`/productos/${id}/`, form).then(() => navigate("/admin/dashboard/productos"));
  };

  return (
    <div>
      <h2>Editar Producto</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(form).map(([name, value]) =>
          name !== "id_prod" ? (
            <input
              key={name}
              className="form-control mb-2"
              name={name}
              value={value || ""}
              placeholder={name.replace(/_/g, " ")}
              onChange={handleChange}
            />
          ) : null
        )}
        <button className="btn btn-success">Actualizar</button>
      </form>
    </div>
  );
}

export default ProductoEdit;
