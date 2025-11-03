import React, { useEffect, useState, useMemo } from "react";
// 1. Importamos 'useLocation' para leer query params
import { useNavigate, useLocation } from "react-router-dom"; 
// 2. Importamos 'getProductoById' para el modal
import { getProductos, deleteProducto, getProductosBajoStock, getProductoById } from "../../api/productos"; 
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";

import ProductoDetailModal from "../../components/Productos/ProductDetailModa";
import StockHistoryModal from "../../components/Productos/StockHistoryModal";
import StockUpdateModal from "../../components/Productos/StockUpdateModal";

// (Componente ProductoCard - sin cambios)
function ProductoCard({ producto, onCardClick, onDeleteClick, onEditClick, COLORS }) {
  const { id_prod, nombre_prod, precio_venta, stock_act_prod, stock_min_prod, imagen_url } = producto;
  const isLowStock = stock_act_prod <= stock_min_prod;
  return (
    <div className={`product-card ${isLowStock ? "low-stock" : ""}`} style={{ borderColor: COLORS.borderColor, backgroundColor: COLORS.cardBackground }}>
      <div className="card-image-container" onClick={() => onCardClick(producto)}>
        <img src={imagen_url || "https://via.placeholder.com/150?text=Sin+Imagen"} alt={nombre_prod} className="card-image"/>
        {isLowStock && (<span className="stock-badge" style={{ backgroundColor: COLORS.danger }}>Bajo Stock</span>)}
      </div>
      <div className="card-content" onClick={() => onCardClick(producto)}>
        <h3 className="card-title" style={{ color: COLORS.text }}>{nombre_prod}</h3>
        <p className="card-detail price" style={{ color: COLORS.primary }}>${precio_venta}</p>
        <p className="card-detail" style={{ color: COLORS.dark }}>Stock: <strong>{stock_act_prod}</strong></p>
      </div>
      <div className="card-actions">
        <button onClick={() => onEditClick(id_prod)} className="btn btn-secondary" style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }}>
          Editar
        </button>
        <button onClick={() => onDeleteClick(id_prod)} className="btn btn-danger" style={{ backgroundColor: COLORS.danger, borderColor: COLORS.danger }}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

// (Componente AlertaStockBajo - sin cambios)
function AlertaStockBajo({ count, onClick }) {
  if (count === 0) return null;
  return (
    <div className="dashboard-alert" onClick={onClick}>
      <strong>¡Alerta!</strong> Tienes <strong>{count}</strong> producto(s) por debajo del stock mínimo.
      <button className="btn btn-danger" style={{marginLeft: 'auto', padding: '0.5rem 1rem'}}>Ver</button>
      <style>{`
        .dashboard-alert {
          background-color: rgba(217, 83, 79, 0.1); border: 1px solid var(--danger-color);
          color: var(--danger-color); padding: 1rem; border-radius: 8px;
          margin-bottom: 1.5rem; display: flex; align-items: center;
          gap: 1rem; cursor: pointer;
        }
      `}</style>
    </div>
  );
}


// Componente principal de la Página
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

  const COLORS = useMemo(() => ({
    primary: "#fb5b5b", secondary: "#4a90e2", danger: "#d9534f",
    warning: "#f0ad4e", info: "#5bc0de", success: "#5cb85c",
    dark: "#343a40", light: "#f8f9fa", text: "#333",
    background: "#f4f7f6", cardBackground: "#ffffff", borderColor: "#dee2e6",
  }), []);

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

  // --- Handlers de Modales ---
  
  // (Historial Específico - PASO 1)
  const handleCardClick = (producto) => {
    setSelectedProducto(producto);
    setIsDetailOpen(true);
  };
  const closeDetailModal = () => setIsDetailOpen(false);

  // (Historial Específico - PASO 2)
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

  if (loading)
    return <p style={{ color: COLORS.text }}>Cargando productos...</p>;
  if (error)
    return <p className="message error" style={{ color: COLORS.danger }}>{error}</p>;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2 style={{ color: COLORS.text }}>Gestión de Productos ({productos.length})</h2>
        
        {/* --- BOTONES DE ACCIÓN DEL HEADER --- */}
        <div className="header-actions">
          <button
            onClick={() => navigate("/admin/dashboard/stock-history")}
            className="btn btn-secondary"
            style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }}
          >
            Ver Historial General
          </button>
          <button
            onClick={() => navigate("/admin/dashboard/productos/create")}
            className="btn btn-primary"
            style={{ backgroundColor: COLORS.primary, borderColor: COLORS.primary }}
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

      <div className="checkbox-group" style={{ marginBottom: "1.5rem" }}>
        <input
          type="checkbox"
          id="bajo_stock"
          checked={filtroBajoStock}
          onChange={(e) => setFiltroBajoStock(e.target.checked)}
          style={{ accentColor: COLORS.primary }}
        />
        <label htmlFor="bajo_stock" style={{ color: COLORS.text }}>
          Mostrar solo productos con bajo stock
        </label>
      </div>

      <div className="product-cards-grid">
        {productos.length === 0 ? (
          <p style={{ color: COLORS.text }}>No hay productos para mostrar.</p>
        ) : (
          productos.map((prod) => (
            <ProductoCard
              key={prod.id_prod}
              producto={prod}
              onCardClick={handleCardClick}
              onDeleteClick={handleShowDelete}
              onEditClick={(id) => navigate(`/admin/dashboard/productos/edit/${id}`)}
              COLORS={COLORS}
            />
          ))
        )}
      </div>

      {/* --- MODALES --- */}

      {/* (Historial Específico - PASO 3) */}
      {isDetailOpen && selectedProducto && (
        <ProductoDetailModal
          producto={selectedProducto}
          onClose={closeDetailModal}
          onShowHistory={handleShowHistory}
          onUpdateStock={handleShowUpdateStock}
        />
      )}

      {/* (Historial Específico - PASO 4) */}
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
              <button onClick={closeDeleteModal} className="btn btn-secondary" style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }}>
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-danger" style={{ backgroundColor: COLORS.danger, borderColor: COLORS.danger }}>
                Eliminar
              </button>
            </>
          }
        >
          <p style={{ color: COLORS.text }}>
            ¿Estás seguro de que deseas eliminar este producto? Esta acción no se
            puede deshacer.
          </p>
        </Modal>
      )}

      {/* --- ESTILOS --- */}
      <style>{`
        :root {
          --primary-color: ${COLORS.primary};
          --secondary-color: ${COLORS.secondary};
          --danger-color: ${COLORS.danger};
          --warning-color: ${COLORS.warning};
          --text-color: ${COLORS.text};
          --background-color: ${COLORS.background};
          --card-background: ${COLORS.cardBackground};
          --border-color: ${COLORS.borderColor};
          --dark-color: ${COLORS.dark};
          --info-color: ${COLORS.info};
        }
        .admin-page-container { padding: 2rem; background-color: var(--background-color); min-height: calc(100vh - var(--header-height, 0px)); }
        
        .admin-page-header { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; 
        }
        .admin-page-header h2 { margin: 0; color: var(--text-color); font-size: 2rem; }
        .header-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

        .btn { padding: 0.75rem 1.25rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.3s ease; border: 1px solid transparent; }
        .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; }
        .btn-primary { background-color: var(--primary-color); color: white; border-color: var(--primary-color); }
        .btn-primary:hover { background-color: #e04a4a; border-color: #e04a4a; }
        .btn-secondary { background-color: var(--secondary-color); color: white; border-color: var(--secondary-color); }
        .btn-secondary:hover { background-color: #3a7bc4; border-color: #3a7bc4; }
        .btn-danger { background-color: var(--danger-color); color: white; border-color: var(--danger-color); }
        .btn-danger:hover { background-color: #c9302c; border-color: #c9302c; }
        .checkbox-group { display: flex; align-items: center; gap: 0.5rem; }
        .checkbox-group input[type="checkbox"] { width: 1.25rem; height: 1.25rem; cursor: pointer; }
        .checkbox-group label { font-size: 1rem; color: var(--dark-color); cursor: pointer; }
        .product-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .product-card { background-color: var(--card-background); border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; border: 1px solid var(--border-color); }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12); }
        .product-card.low-stock { border: 2px solid var(--danger-color); }
        .card-image-container { width: 100%; height: 200px; overflow: hidden; background-color: #e9ecef; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; }
        .stock-badge { position: absolute; top: 10px; left: 10px; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
        .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
        .product-card:hover .card-image { transform: scale(1.05); }
        .card-content { padding: 1.5rem; flex-grow: 1; cursor: pointer; }
        .card-title { font-size: 1.25rem; margin-top: 0; margin-bottom: 0.5rem; color: var(--text-color); line-height: 1.3; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-detail { font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--dark-color); }
        .card-detail strong { color: var(--text-color); }
        .card-detail.price { font-size: 1.2rem; font-weight: 700; color: var(--primary-color); margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .card-actions { padding: 1rem 1.5rem; display: flex; gap: 0.75rem; justify-content: center; border-top: 1px solid var(--border-color); }
        .card-actions .btn { flex: 1; }
        @media (max-width: 768px) {
          .admin-page-container { padding: 1rem; }
          .admin-page-header { flex-direction: column; align-items: flex-start; }
          .admin-page-header h2 { font-size: 1.75rem; }
          .product-cards-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .card-actions { flex-direction: column; }
        }
        @media (max-width: 480px) {
            .admin-page-header .btn { width: 100%; }
            .header-actions { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
}