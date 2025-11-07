// front/src/pages/Admin/AdminProductos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductos, deleteProducto, getProductosBajoStock, getProductoById } from "../../api/productos"; 
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";

import ProductoDetailModal from "../../components/Productos/ProductDetailModa";
import StockHistoryModal from "../../components/Productos/StockHistoryModal";
import StockUpdateModal from "../../components/Productos/StockUpdateModal";

// 💡 1. Importamos el nuevo CSS
import "../../CSS/AdminProductos.css";

// --- Sub-componente ProductoCard (Refactorizado) ---
// 💡 Se eliminó la prop 'COLORS' y todos los 'style'
function ProductoCard({ producto, onCardClick, onDeleteClick, onEditClick }) {
  const { id_prod, nombre_prod, precio_venta, stock_act_prod, stock_min_prod, imagen_url } = producto;
  const isLowStock = stock_act_prod <= stock_min_prod;
  
  return (
    <div className={`product-card ${isLowStock ? "low-stock" : ""}`}>
      <div className="card-image-container" onClick={() => onCardClick(producto)}>
        <img src={imagen_url || "https://via.placeholder.com/150?text=Sin+Imagen"} alt={nombre_prod} className="card-image"/>
        {isLowStock && (<span className="stock-badge">Bajo Stock</span>)}
      </div>
      <div className="card-content" onClick={() => onCardClick(producto)}>
        <h3 className="card-title">{nombre_prod}</h3>
        <p className="card-detail price">${precio_venta}</p>
        <p className="card-detail">Stock: <strong>{stock_act_prod}</strong></p>
      </div>
      <div className="card-actions">
        {/* 💡 Estos botones ya usan las clases globales .btn, .btn-secondary, .btn-danger */}
        <button onClick={() => onEditClick(id_prod)} className="btn btn-secondary">
          Editar
        </button>
        <button onClick={() => onDeleteClick(id_prod)} className="btn btn-danger">
          Eliminar
        </button>
      </div>
    </div>
  );
}

// --- Sub-componente AlertaStockBajo (Refactorizado) ---
// 💡 Se eliminó el <style> y se usan clases globales
function AlertaStockBajo({ count, onClick }) {
  if (count === 0) return null;
  return (
    // 💡 Usamos las clases globales 'alert' y 'alert-error'
    <div className="alert alert-error dashboard-alert" onClick={onClick}>
      <strong>¡Alerta!</strong> Tienes <strong>{count}</strong> producto(s) por debajo del stock mínimo.
      {/* 💡 Se añade 'btn-sm' para un botón más pequeño */}
      <button className="btn btn-danger btn-sm">Ver</button>
    </div>
  );
}


// --- Componente principal de la Página ---
export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [filtroBajoStock, setFiltroBajoStock] = useState(false);

  // 💡 2. Objeto COLORS eliminado. Las variables CSS globales lo reemplazan.

  // --- Lógica de carga y Handlers (sin cambios) ---
  const cargarDatos = async (filtroActivo) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtroActivo) {
        params.bajo_stock = "1";
      }
      const [productosRes, alertasRes] = await Promise.all([
        getProductos(params),
        getProductosBajoStock() 
      ]);
      setProductos(productosRes.data);
      setProductosBajoStock(alertasRes.data);
    } catch (error) {
      setError("Error al cargar productos.");
      toast.error("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const filtroURL = queryParams.get('filtro') === 'bajo_stock';
    if (filtroURL) {
      setFiltroBajoStock(true);
    }
    cargarDatos(filtroBajoStock || filtroURL);
  }, [filtroBajoStock, location.search]);

  const handleCardClick = (producto) => {
    setSelectedProducto(producto);
    setIsDetailOpen(true);
  };
  const closeDetailModal = () => setIsDetailOpen(false);

  const handleShowHistory = () => {
    setIsDetailOpen(false); 
    setIsHistoryOpen(true); 
  };
  const closeHistoryModal = () => {
    setIsHistoryOpen(false);
    setIsDetailOpen(true); 
  };

  const handleShowUpdateStock = () => {
    setIsDetailOpen(false); 
    setIsUpdateStockOpen(true); 
  };
  const closeUpdateStockModal = () => {
    setIsUpdateStockOpen(false);
    setIsDetailOpen(true); 
  };

  const handleShowDelete = (id) => {
    setSelectedProducto({ id_prod: id }); 
    setIsDeleteOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteOpen(false);
  
  const handleDeleteConfirm = async () => {
    if (!selectedProducto?.id_prod) return;
    try {
      await deleteProducto(selectedProducto.id_prod);
      toast.success("Producto eliminado.");
      closeDeleteModal();
      cargarDatos(filtroBajoStock); 
    } catch (error) {
      toast.error("Error al eliminar el producto.");
    }
  };

  const handleStockUpdated = () => {
    cargarDatos(filtroBajoStock); 
    const fetchUpdatedProduct = async () => {
      try {
        const { data } = await getProductoById(selectedProducto.id_prod);
        setSelectedProducto(data);
      } catch (e) { console.error(e); }
    };
    fetchUpdatedProduct();
  };

  const handleAlertaClick = () => {
    setFiltroBajoStock(true); 
    navigate('/admin/dashboard/productos'); 
  };
  // --------------------------------------------------

  if (loading)
    return <p>Cargando productos...</p>; // 💡 'style' eliminado
  if (error)
    // 💡 3. Se usa la clase global de alerta
    return <div className="alert alert-error">{error}</div>;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2 /* 💡 'style' eliminado */>Gestión de Productos ({productos.length})</h2>
        
        <div className="header-actions">
          <button
            onClick={() => navigate("/admin/dashboard/stock-history")}
            className="btn btn-secondary" // 💡 'style' eliminado
          >
            Ver Historial General
          </button>
          <button
            onClick={() => navigate("/admin/dashboard/productos/create")}
            className="btn btn-primary" // 💡 'style' eliminado
          >
            Crear Producto
          </button>
        </div>
      </div>

      {!filtroBajoStock && (
        <AlertaStockBajo
          count={productosBajoStock.length}
          onClick={handleAlertaClick}
        />
      )}

      <div className="checkbox-group" /* 💡 'style' eliminado */>
        <input
          type="checkbox"
          id="bajo_stock"
          checked={filtroBajoStock}
          onChange={(e) => setFiltroBajoStock(e.target.checked)}
          // 💡 'style' eliminado (se maneja en CSS)
        />
        <label htmlFor="bajo_stock" /* 💡 'style' eliminado */>
          Mostrar solo productos con bajo stock
        </label>
      </div>

      <div className="product-cards-grid">
        {productos.length === 0 ? (
          <p /* 💡 'style' eliminado */>No hay productos para mostrar.</p>
        ) : (
          productos.map((prod) => (
            <ProductoCard
              key={prod.id_prod}
              producto={prod}
              onCardClick={handleCardClick}
              onDeleteClick={handleShowDelete}
              onEditClick={(id) => navigate(`/admin/dashboard/productos/edit/${id}`)}
              // 💡 4. Prop 'COLORS' eliminada
            />
          ))
        )}
      </div>

      {/* --- MODALES --- */}
      {/* (Estos modales ya usan estilos globales) */}

      {isDetailOpen && selectedProducto && (
        <ProductoDetailModal
          producto={selectedProducto}
          onClose={closeDetailModal}
          onShowHistory={handleShowHistory}
          onUpdateStock={handleShowUpdateStock}
        />
      )}

      {isHistoryOpen && selectedProducto && (
        <StockHistoryModal
          productoId={selectedProducto.id_prod}
          onClose={closeHistoryModal}
        />
      )}

      {isUpdateStockOpen && selectedProducto && (
        <StockUpdateModal
          producto={selectedProducto}
          onClose={closeUpdateStockModal}
          onStockUpdated={handleStockUpdated}
        />
      )}
      
      {isDeleteOpen && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          title="Confirmar Eliminación"
          footer={
            <>
              <button onClick={closeDeleteModal} className="btn btn-secondary" /* 💡 'style' eliminado */>
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger" /* 💡 'style' eliminado */>
                Eliminar
              </button>
            </>
          }
        >
          <p /* 💡 'style' eliminado */>
            ¿Estás seguro de que deseas eliminar este producto? Esta acción no se
            puede deshacer.
          </p>
        </Modal>
      )}

      {/* 💡 5. Bloque <style> eliminado */}
    </div>
  );
}