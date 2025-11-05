// src/components/Productos/ProductDetailModa.jsx
import React from 'react';
import Modal from '../Common/Modal';

// 💡 1. Importamos el nuevo archivo CSS
import '../../CSS/ProductDetailModal.css';

export default function ProductoDetailModal({ producto, onClose, onUpdateStock, onShowHistory }) {
  if (!producto) return null;

  const {
    nombre_prod,
    marca,
    categoria,
    precio_venta,
    precio_compra,
    stock_act_prod,
    stock_min_prod,
    imagen_url
  } = producto;

  return (
    <Modal isOpen={true} onClose={onClose} title={nombre_prod}>
      {/* 💡 2. Estas clases ahora se definen en el CSS externo */}
      <div className="producto-detalle-grid">
        <div className="producto-detalle-img">
          <img src={imagen_url || 'https://via.placeholder.com/300'} alt={nombre_prod} />
        </div>
        <div className="producto-detalle-info">
          <p><strong>Marca:</strong> {marca?.nombre || "N/A"}</p>
          <p><strong>Categoría:</strong> {categoria?.nombre || "N/A"}</p>
          <hr />
          <p><strong>Precio Venta:</strong> ${precio_venta}</p>
          <p><strong>Precio Compra:</strong> ${precio_compra}</p>
          <hr />
          {/* 💡 3. La clase 'low-stock-text' se aplica al <p> */}
          <p className={stock_act_prod <= stock_min_prod ? 'low-stock-text' : ''}>
            <strong>Stock Actual:</strong> {stock_act_prod}
          </p>
          <p><strong>Stock Mínimo:</strong> {stock_min_prod}</p>
        </div>
      </div>
      
      <div className="producto-detalle-acciones">
        {/* 💡 4. Estos botones ya usan las clases globales */}
        <button className="btn btn-secondary" onClick={onShowHistory}>
          Ver Historial
        </button>
        <button className="btn btn-primary" onClick={onUpdateStock}>
          Actualizar Stock
        </button>
      </div>

      {/* 💡 5. El bloque <style> se ha eliminado */}
    </Modal>
  );
}