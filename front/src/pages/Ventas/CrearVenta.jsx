// ========================================
// src/pages/Ventas/CrearVenta.jsx (desde turno)
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, CreditCard } from 'lucide-react';
import { turnosApi } from '../../api/turnosApi';
import { ventasApi } from '../../api/ventasApi';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CrearVenta.module.css';

export const CrearVenta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const turnoId = searchParams.get('turno_id');
  const { showSuccess, showError } = useSwal();

  const [turno, setTurno] = useState(null);
  const [items, setItems] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  // Load turno data if turno_id provided
  useEffect(() => {
    if (turnoId) {
      const fetchTurno = async () => {
        try {
          const data = await turnosApi.getTurno(turnoId);
          setTurno(data);
          // Pre-fill items from turno services
          setItems((data.servicios || []).map(s => ({
            tipo: 'servicio',
            id: s.id,
            nombre: s.nombre || s,
            precio: s.precio || 0,
            cantidad: 1,
          })));
        } catch (error) {
          console.error('Error:', error);
        }
      };
      fetchTurno();
    }
  }, [turnoId]);

  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const updateItemPrice = (index, newPrice) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, precio: parseInt(newPrice) || 0 } : item
    ));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await ventasApi.crearVenta({
        turno_id: turnoId ? parseInt(turnoId) : null,
        cliente_id: turno?.cliente_id,
        servicios: items.filter(i => i.tipo === 'servicio').map(i => ({
          servicio_id: i.id,
          precio: i.precio,
          cantidad: i.cantidad,
        })),
        metodo_pago: metodoPago,
        total,
      });
      await showSuccess('¡Venta registrada!', `Total: ${formatCurrency(total)}`);
      navigate('/ventas');
    } catch (error) {
      showError('Error', error.message || 'No se pudo registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1>Nueva Venta</h1>
      </header>

      <div className={styles.content}>
        <Card>
          <h2>Detalle de la Venta</h2>
          
          {turno && (
            <div className={styles.turnoInfo}>
              <p>Cliente: <strong>{turno.cliente_nombre}</strong></p>
              <p>Turno: {turno.fecha} - {turno.hora}</p>
            </div>
          )}

          <div className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={index} className={styles.item}>
                <span className={styles.itemName}>{item.nombre}</span>
                <Input
                  type="number"
                  value={item.precio}
                  onChange={(e) => updateItemPrice(index, e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            ))}
          </div>

          <div className={styles.metodoPago}>
            <label>Método de pago</label>
            <select 
              value={metodoPago} 
              onChange={(e) => setMetodoPago(e.target.value)}
              className={styles.select}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div className={styles.totalSection}>
            <span>Total</span>
            <span className={styles.totalAmount}>{formatCurrency(total)}</span>
          </div>

          <Button
            fullWidth
            icon={Check}
            loading={loading}
            onClick={handleSubmit}
          >
            Guardar Venta
          </Button>
        </Card>
      </div>
    </motion.div>
  );
};