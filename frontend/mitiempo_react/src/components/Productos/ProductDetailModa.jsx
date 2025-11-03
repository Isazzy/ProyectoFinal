import React from 'react';
import Modal from '../Common/Modal';

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
          <p className={stock_act_prod <= stock_min_prod ? 'low-stock-text' : ''}>
            <strong>Stock Actual:</strong> {stock_act_prod}
          </p>
          <p><strong>Stock Mínimo:</strong> {stock_min_prod}</p>
        </div>
      </div>
      
      <div className="producto-detalle-acciones">
        <button className="btn btn-secondary" onClick={onShowHistory}>
          Ver Historial
        </button>
        <button className="btn btn-primary" onClick={onUpdateStock}>
          Actualizar Stock
        </button>
      </div>

      <style>{`
        .producto-detalle-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
        }
        .producto-detalle-img img {
          width: 100%;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .producto-detalle-info p {
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        .producto-detalle-info hr {
          margin: 1rem 0;
          border-color: var(--border-color);
        }
        .producto-detalle-acciones {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .low-stock-text {
          color: var(--danger-color);
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .producto-detalle-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
}