import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {getProductos, createProducto} from "../../api/productos";

function ProductoForm() {
  const [form, setForm] = useState({
    nombre_prod: "",
    precio_venta: "",
    precio_compra: "",
    stock_min_prod: "",
    stock_act_prod: "",
    reposicion_prod: "",
    stock_max_prod: "",
    tipo_prod: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProducto("/productos/", form).then(() => navigate("/admin/dashboard/productos"));
  };

  return (
    <div>
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(form).map(([name, value]) => (
          <input
            key={name}
            className="form-control mb-2"
            name={name}
            value={value}
            placeholder={name.replace(/_/g, " ")}
            onChange={handleChange}
          />
        ))}
        <button className="btn btn-primary">Guardar</button>
      </form>
    </div>
  );
}

export default ProductoForm;
