// src/components/Productos/StockUpdateModal.jsx
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import { createStockMovement } from '../../api/productos';
import toast from 'react-hot-toast';

export default function StockUpdateModal({ producto, onClose, onStockUpdated }) {
  const [cantidad, setCantidad] = useState("");
  const [razon, setRazon] = useState("Ajuste manual de inventario");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cantidadNum = parseInt(cantidad, 10);

    if (isNaN(cantidadNum) || cantidadNum === 0) {
      setError("La cantidad debe ser un número distinto de cero.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        producto: producto.id_prod,
        cantidad_movida: cantidadNum, // ej: 10 (entrada) o -5 (salida)
        tipo_movimiento: "AJUSTE",
        razon: razon,
      };
      await createStockMovement(payload);
      toast.success("Stock actualizado con éxito.");
      onStockUpdated(); // Llama al padre para refrescar todo
      onClose(); // Cierra este modal
    } catch (err) {
      setError("Error al actualizar el stock.");
      toast.error("Error al actualizar el stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Actualizar Stock: ${producto.nombre_prod}`}
      footer={
        <>
          {/* Clases globales correctas */}
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? "Actualizando..." : "Confirmar Ajuste"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        
        {/* 🎨 ¡ACTUALIZADO! Se usa la clase de alerta global */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        
        <p>Stock actual: <strong>{producto.stock_act_prod}</strong></p>
        
        {/* Clases globales correctas */}
        <div className="form-group">
          <label htmlFor="cantidad_movida">Cantidad a Mover</label>
          <input
            id="cantidad_movida"
            type="number"
            className="form-input"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Ej: 10 (para agregar) o -5 (para quitar)"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="razon">Razón del Ajuste</label>
          <input
            id="razon"
            type="text"
            className="form-input"
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}