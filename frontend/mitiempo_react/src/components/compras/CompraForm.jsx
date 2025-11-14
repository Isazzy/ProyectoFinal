// src/components/Compras/CompraForm.jsx
import React, { useState, useEffect } from 'react';
import { compraService, proveedorService } from '../../api/axiosConfig';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CompraForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [formData, setFormData] = useState({
    proveedor: '',
    id_caja: 1,
    metodo_pago: 'EFECTIVO',
    notas: '',
    estado: 'PENDIENTE',
  });

  const [detalles, setDetalles] = useState([
    { producto: '', cantidad: 1, precio_um: 0 }
  ]);

  // Cargar proveedores activos
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await proveedorService.getActivos();
        const list = Array.isArray(res)
         ? res
         : (res?.results ?? res?.data ?? []);
        setProveedores(list || []);
      } catch (error) {
        console.error('Error cargando proveedores:', error);
      }
    };
    fetchProveedores();
  }, []);

  // TODO: Cargar productos (debes tener un productoService)
  // useEffect(() => {
  //   const fetchProductos = async () => {
  //     const response = await productoService.getAll();
  //     setProductos(response);
  //   };
  //   fetchProductos();
  // }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDetalleChange = (index, field, value) => {
    const newDetalles = [...detalles];
    newDetalles[index][field] = value;
    setDetalles(newDetalles);
  };

  const agregarDetalle = () => {
    setDetalles([
      ...detalles,
      { producto: '', cantidad: 1, precio_um: 0 }
    ]);
  };

  const eliminarDetalle = (index) => {
    if (detalles.length === 1) {
      alert('Debe haber al menos un producto en la compra');
      return;
    }
    const newDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(newDetalles);
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, detalle) => {
      const subtotal = parseFloat(detalle.cantidad) * parseFloat(detalle.precio_um || 0);
      return sum + subtotal;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.proveedor) {
      alert('Debe seleccionar un proveedor');
      return;
    }

    if (detalles.some(d => !d.producto || d.cantidad <= 0 || d.precio_um <= 0)) {
      alert('Todos los productos deben tener cantidad y precio válidos');
      return;
    }

    setLoading(true);

    try {
      const compraData = {
        ...formData,
        ro_usuario: user?.id,
        detalles: detalles.map(d => ({
          producto: parseInt(d.producto),
          cantidad: parseFloat(d.cantidad),
          precio_um: parseFloat(d.precio_um),
        })),
      };

      const response = await compraService.create(compraData);
      
      alert('Compra creada exitosamente');
      navigate(`/admin/dashboard/compras/${response.id_compra}`);
      
    } catch (error) {
      console.error('Error creando compra:', error);
      alert(error.response?.data?.error || 'Error al crear la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compra-form-container">
      <h2>Nueva Compra</h2>

      <form onSubmit={handleSubmit}>
        {/* Datos generales */}
        <div className="form-section">
          <h3>Datos Generales</h3>

          <div className="form-group">
            <label>Proveedor: *</label>
            <select
              name="proveedor"
              value={formData.proveedor}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un proveedor</option>
              {proveedores.map(prov => (
                <option key={prov.id_prov} value={prov.id_prov}>
                  {prov.nombre_prov}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Caja:</label>
            <input
              type="number"
              name="id_caja"
              value={formData.id_caja}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Método de Pago:</label>
            <select
              name="metodo_pago"
              value={formData.metodo_pago}
              onChange={handleChange}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="COMPLETADA">Completada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notas:</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="3"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* Detalles de compra */}
        <div className="form-section">
          <div className="section-header">
            <h3>Productos</h3>
            <button
              type="button"
              onClick={agregarDetalle}
              className="btn btn-sm btn-success"
            >
              + Agregar Producto
            </button>
          </div>

          <div className="detalles-list">
            {detalles.map((detalle, index) => (
              <div key={index} className="detalle-item">
                <div className="detalle-row">
                  <div className="form-group flex-2">
                    <label>Producto:</label>
                    <select
                      value={detalle.producto}
                      onChange={(e) => handleDetalleChange(index, 'producto', e.target.value)}
                      required
                    >
                      <option value="">Seleccione producto</option>
                      {productos.map(prod => (
                        <option key={prod.id_prod} value={prod.id_prod}>
                          {prod.nombre_prod}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cantidad:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={detalle.cantidad}
                      onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio Unitario:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={detalle.precio_um}
                      onChange={(e) => handleDetalleChange(index, 'precio_um', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtotal:</label>
                    <input
                      type="text"
                      value={`$${(detalle.cantidad * detalle.precio_um).toFixed(2)}`}
                      disabled
                      className="input-disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      onClick={() => eliminarDetalle(index)}
                      className="btn btn-sm btn-danger"
                      disabled={detalles.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="total-section">
            <h3>Total: ${calcularTotal().toFixed(2)}</h3>
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/compras')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Crear Compra'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompraForm;