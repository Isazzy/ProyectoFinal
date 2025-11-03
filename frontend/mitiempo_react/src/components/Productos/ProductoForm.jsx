import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProducto,
  updateProducto,
  getProductoById,
  getMarcas,
  getCategorias,
  createMarca,
  createCategoria,
} from "../../api/productos";
import toast from "react-hot-toast";
import { uploadToImgur } from "../../components/Productos/Imgur";
import QuickCreateModal from "../Common/QuickCreateModal";

const initialState = {
  nombre_prod: "",
  marca: "",
  categoria: "",
  precio_venta: "",
  precio_compra: "",
  stock_min_prod: 0,
  stock_act_prod: 0,
  reposicion_prod: 0,
  stock_max_prod: 0,
  imagen_url: "",
};

export default function ProductoForm() {
  const [producto, setProducto] = useState(initialState);
  const [imagenFile, setImagenFile] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const loadDropdowns = async () => {
    try {
      const [marcasRes, catRes] = await Promise.all([
        getMarcas(),
        getCategorias(),
      ]);
      setMarcas(marcasRes.data || []);
      setCategorias(catRes.data || []);
    } catch (err) {
      toast.error("Error al recargar listas.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        await loadDropdowns();

        if (isEditing) {
          const { data } = await getProductoById(id);
          setProducto({
            ...data,
            marca: data.marca?.id_marca || "",
            categoria: data.categoria?.id_categoria || "",
            imagen_url: data.imagen_url || "",
          });
          setPreviewImg(data.imagen_url || "");
        }
      } catch (err) {
        setError("Error al cargar los datos necesarios.");
        toast.error("Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  useEffect(() => {
    if (imagenFile) {
      setPreviewImg(URL.createObjectURL(imagenFile));
    }
  }, [imagenFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "imagen_url" && value && !imagenFile) {
      setPreviewImg(value);
    }
  };

  const handleFileChange = (e) => {
    setImagenFile(e.target.files[0] || null);
    setProducto((prev) => ({
      ...prev,
      imagen_url: "",
    }));
  };

  const handleRemoveFile = () => {
    setImagenFile(null);
    setPreviewImg(producto.imagen_url || "");
  };

  const handleQuickCreate = async (type, createFn, data) => {
    try {
      const nuevaEntidad = await createFn(data); 
      await loadDropdowns(); 

      if (type === 'marca') {
        setProducto(prev => ({ ...prev, marca: nuevaEntidad.data.id_marca }));
        setIsMarcaModalOpen(false);
      } else if (type === 'categoria') {
        setProducto(prev => ({ ...prev, categoria: nuevaEntidad.data.id_categoria }));
        setIsCategoriaModalOpen(false);
      }
      return nuevaEntidad.data; 
    } catch (err) {
      throw err; 
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- CORRECCIÓN ---
    // Validación de campos obligatorios para prevenir el 400 Bad Request
    if (!producto.nombre_prod || !producto.precio_venta || producto.precio_venta <= 0) {
      setError("El Nombre y el Precio de Venta (mayor a 0) son obligatorios.");
      toast.error("Faltan campos obligatorios.");
      return;
    }
    // --------------------

    setLoading(true);
    let imagenUrlFinal = producto.imagen_url || "";

    if (imagenFile) {
      try {
        imagenUrlFinal = await uploadToImgur(imagenFile);
      } catch (err) {
        setError("Error al subir la imagen a Imgur.");
        toast.error("Error al subir la imagen.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      ...producto,
      imagen_url: imagenUrlFinal || null,
      precio_venta: parseFloat(producto.precio_venta) || 0,
      precio_compra: parseFloat(producto.precio_compra) || 0,
      stock_min_prod: parseInt(producto.stock_min_prod, 10) || 0,
      stock_act_prod: parseInt(producto.stock_act_prod, 10) || 0,
      reposicion_prod: parseInt(producto.reposicion_prod, 10) || 0,
      stock_max_prod: parseInt(producto.stock_max_prod, 10) || 0,
      marca: producto.marca || null,
      categoria: producto.categoria || null,
    };

    try {
      if (isEditing) {
        await updateProducto(id, payload);
        toast.success("Producto actualizado");
      } else {
        await createProducto(payload);
        toast.success("Producto creado");
      }
      navigate("/admin/dashboard/productos");
    } catch (err) {
      // Intentar obtener un error más específico del serializer
      const apiError = err.response?.data;
      if (apiError) {
        const firstKey = Object.keys(apiError)[0];
        const errorMsg = Array.isArray(apiError[firstKey]) ? apiError[firstKey][0] : apiError[firstKey];
        setError(`${firstKey}: ${errorMsg}`);
      } else {
        setError("Error al guardar el producto. Revisa los campos.");
      }
      toast.error("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !producto.nombre_prod) return <p>Cargando formulario...</p>;

  return (
    <div className="form-container">
      <h2>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>

      <form onSubmit={handleSubmit}>
        {error && <p className="message error">{error}</p>}

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="nombre_prod">Nombre del producto</label>
            <input
              id="nombre_prod" name="nombre_prod" className="form-input"
              value={producto.nombre_prod} onChange={handleChange}
              placeholder="Ej: Shampoo Anticaspa" required
            />
          </div>
          <div className="form-group">
            <label>Imagen de Producto</label>
            {previewImg && (
              <div style={{ marginBottom: "0.5rem", display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={previewImg} alt="Preview" style={{ maxWidth: "120px", maxHeight: '80px', borderRadius: '4px' }} />
                {imagenFile && (
                  <button type="button" onClick={handleRemoveFile} className="btn btn-secondary btn-sm">
                    Quitar
                  </button>
                )}
              </div>
            )}
            <input
              id="imagen_file" name="imagen_file" className="form-input"
              type="file" accept="image/*" onChange={handleFileChange}
              disabled={loading}
            />
            {!imagenFile && (
              <input
                id="imagen_url" name="imagen_url" className="form-input"
                value={producto.imagen_url || ""} onChange={handleChange}
                placeholder="Pega URL pública de imgur.com" disabled={loading}
                style={{marginTop: '0.5rem'}}
              />
            )}
            {!imagenFile && (
              <small>
                Sube una imagen o pega la URL de una imagen pública de <a href="https://imgur.com/" target="_blank" rel="noopener noreferrer">imgur.com</a>.
              </small>
            )}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="marca">Marca</label>
            <div className="input-with-button">
              <select
                id="marca" name="marca" className="form-select"
                value={producto.marca || ""} onChange={handleChange}
              >
                <option value="">Seleccionar marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id_marca} value={marca.id_marca}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-add-quick"
                onClick={() => setIsMarcaModalOpen(true)}
                disabled={loading}
                title="Crear nueva marca"
              >
                +
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <div className="input-with-button">
              <select
                id="categoria" name="categoria" className="form-select"
                value={producto.categoria || ""} onChange={handleChange}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-add-quick"
                onClick={() => setIsCategoriaModalOpen(true)}
                disabled={loading}
                title="Crear nueva categoría"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="precio_venta">Precio Venta ($)</label>
            <input
              id="precio_venta" name="precio_venta" className="form-input"
              value={producto.precio_venta} onChange={handleChange}
              type="number" step="0.01" min="0" required
            />
          </div>
          <div className="form-group">
            <label htmlFor="precio_compra">Precio Compra ($)</label>
            <input
              id="precio_compra" name="precio_compra" className="form-input"
              value={producto.precio_compra} onChange={handleChange}
              type="number" step="0.01" min="0"
            />
          </div>
        </div>

        <h4>Gestión de Stock</h4>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="stock_act_prod">Stock Actual</label>
            <input
              id="stock_act_prod" name="stock_act_prod" className="form-input"
              value={producto.stock_act_prod} onChange={handleChange}
              type="number" min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock_min_prod">Stock Mínimo</label>
            <input
              id="stock_min_prod" name="stock_min_prod" className="form-input"
              value={producto.stock_min_prod} onChange={handleChange}
              type="number" min="0"
            />
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="stock_max_prod">Stock Máximo</label>
            <input
              id="stock_max_prod" name="stock_max_prod" className="form-input"
              value={producto.stock_max_prod} onChange={handleChange}
              type="number" min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reposicion_prod">Punto de Reposición</label>
            <input
              id="reposicion_prod" name="reposicion_prod" className="form-input"
              value={producto.reposicion_prod} onChange={handleChange}
              type="number" min="0"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button" className="btn btn-secondary"
            onClick={() => navigate("/admin/dashboard/productos")}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
          </button>
        </div>
      </form>

      <QuickCreateModal
        isOpen={isMarcaModalOpen}
        onClose={() => setIsMarcaModalOpen(false)}
        title="Nueva Marca"
        label="Nombre de la marca"
        onSubmit={(data) => handleQuickCreate('marca', createMarca, data)}
      />

      <QuickCreateModal
        isOpen={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
        title="Nueva Categoría"
        label="Nombre de la categoría"
        onSubmit={(data) => handleQuickCreate('categoria', createCategoria, data)}
      />

      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        h4 {
          margin-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
        .input-with-button {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .input-with-button .form-select {
          flex-grow: 1; 
        }
        .btn-add-quick {
          flex-shrink: 0;
          width: 40px; 
          height: 40px; 
          padding: 0;
          font-size: 1.5rem; 
          line-height: 1;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
        }
        .btn-add-quick:disabled {
          background-color: var(--secondary-color);
          cursor: not-allowed;
        }
        .btn-sm { 
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }
        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}