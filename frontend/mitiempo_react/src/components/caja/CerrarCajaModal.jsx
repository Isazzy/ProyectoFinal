import React, { useState } from 'react';
import Modal from 'react-modal';
import { cerrarCaja } from '../../api/caja';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

function CerrarCajaModal({ isOpen, onClose, onSuccess, cajasAbiertas }) {
  const [cajaSeleccionada, setCajaSeleccionada] = useState('');
  const [saldoFinal, setSaldoFinal] = useState('');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cajaSeleccionada) {
      toast.warn('Selecciona una caja');
      return;
    }
    setLoading(true);
    try {
      await cerrarCaja(cajaSeleccionada, {
        caja_saldo_final: saldoFinal ? parseFloat(saldoFinal) : undefined,
        caja_observacion: observacion,
      });
      toast.success('Caja cerrada correctamente');
      setCajaSeleccionada('');
      setSaldoFinal('');
      setObservacion('');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al cerrar caja: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles}>
      <h2>Cerrar Caja</h2>
      <form onSubmit={handleSubmit}>
        <select onChange={(e) => setCajaSeleccionada(e.target.value)} required>
          <option value="">Selecciona una caja abierta</option>
          {cajasAbiertas.map(c => (
            <option key={c.id} value={c.id}>Caja {c.id} - Usuario: {c.usuario}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Saldo final (opcional)"
          value={saldoFinal}
          onChange={(e) => setSaldoFinal(e.target.value)}
          step="0.01"
        />
        <input
          type="text"
          placeholder="Observación"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Cerrando...' : 'Cerrar Caja'}</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </Modal>
  );
}

const customStyles = { /* Igual que arriba */ };

export default CerrarCajaModal;