// ========================================
// src/pages/Inventario/InventarioList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { inventarioApi } from '../../api/inventarioApi';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Badge } from '../../components/ui';
import styles from '../../styles/Inventario.module.css';

export const InventarioList = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { prompt, showSuccess, showError } = useSwal();

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const data = await inventarioApi.getInsumos();
        setInsumos(data.results || data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsumos();
  }, []);

  const handleReponer = async (insumo) => {
    const cantidad = await prompt({
      title: `Reponer ${insumo.nombre}`,
      inputType: 'number',
      inputPlaceholder: 'Cantidad a agregar',
    });

    if (cantidad) {
      try {
        await inventarioApi.actualizarStock(insumo.id, parseInt(cantidad), 'ingreso');
        setInsumos(prev => prev.map(i =>
          i.id === insumo.id ? { ...i, stock: i.stock + parseInt(cantidad) } : i
        ));
        showSuccess('Stock actualizado');
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <h1>Inventario</h1>
        <Button icon={Plus}>Agregar Insumo</Button>
      </header>

      <Card>
        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : insumos.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map(insumo => {
                const critico = insumo.stock < insumo.stock_minimo;
                return (
                  <tr key={insumo.id}>
                    <td>
                      <div className={styles.insumoName}>
                        <Package
                          size={20}
                          style={{ color: critico ? 'var(--danger)' : 'var(--muted)' }}
                        />
                        <span>{insumo.nombre}</span>
                      </div>
                    </td>
                    <td className={critico ? styles.stockCritico : ''}>
                      {insumo.stock} {insumo.unidad}
                    </td>
                    <td className={styles.muted}>
                      {insumo.stock_minimo} {insumo.unidad}
                    </td>
                    <td>
                      <Badge variant={critico ? 'danger' : 'success'}>
                        {critico ? 'Stock Bajo' : 'OK'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Plus}
                        onClick={() => handleReponer(insumo)}
                      >
                        Reponer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <Package size={48} />
            <p>No hay insumos</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
