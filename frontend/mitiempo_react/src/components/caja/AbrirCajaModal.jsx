import React, { useState } from 'react';
import Modal from 'react-modal';
import { abrirCaja } from '../../api/caja';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');  // Para accesibilidad

function AbrirCajaModal({ isOpen, onClose, onSuccess }) {
  const [montoInicial, setMontoInicial] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!montoInicial) {
      toast.warn('Ingresa un monto inicial');
      return;
    }
    setLoading(true);
    try {
      await abrirCaja({ caja_monto_inicial: parseFloat(montoInicial) });
      toast.success('Caja abierta correctamente');
      setMontoInicial('');
      onSuccess();  // Recarga la lista
      onClose();  // Cierra el modal
    } catch (error) {
      toast.error('Error al abrir caja: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <h2>Abrir Nueva Caja</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Monto inicial"
          value={montoInicial}
          onChange={(e) => setMontoInicial(e.target.value)}
          step="0.01"
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Abriendo...' : 'Abrir Caja'}</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </Modal>
  );
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default AbrirCajaModal;