import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, AlertCircle, FlaskConical } from 'lucide-react';
import { serviciosApi } from '../../api/serviciosApi';
import { Button, Input } from '../../components/ui'; 
import styles from '../../styles/Servicios.module.css';

export const InsumoRecetaManager = ({ recetaActual, setRecetaActual, error }) => {
  const [disponibles, setDisponibles] = useState([]);
  const [seleccion, setSeleccion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar insumos al montar
  useEffect(() => {
    const loadInsumos = async () => {
      try {
        setLoading(true);
        const data = await serviciosApi.getInsumosDisponibles(); 
        setDisponibles(data);
      } catch (err) {
        console.error("Error cargando insumos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInsumos();
  }, []);

  const handleAdd = () => {
    const qty = parseFloat(cantidad);
    if (!seleccion || isNaN(qty) || qty <= 0) return;

    const insumoObj = disponibles.find(d => d.id === parseInt(seleccion));
    if (!insumoObj) return;

    // Evitar duplicados
    if (recetaActual.find(r => r.insumo === insumoObj.id)) {
      alert("El insumo ya está en la lista.");
      return;
    }

    const nuevoItem = {
      insumo: insumoObj.id,
      insumo_nombre: insumoObj.nombre,
      insumo_unidad: insumoObj.unidad,
      cantidad_usada: qty,
      stock_actual: insumoObj.stock 
    };

    setRecetaActual([...recetaActual, nuevoItem]);
    setSeleccion("");
    setCantidad("");
  };

  const handleRemove = (insumoId) => {
    setRecetaActual(recetaActual.filter(item => item.insumo !== insumoId));
  };

  // Helper para obtener info del seleccionado
  const selectedInsumoData = disponibles.find(d => d.id === parseInt(seleccion));

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <div className={styles.headerIcon}>
            <FlaskConical size={20} />
        </div>
        <div>
            <h3 className={styles.managerTitle}>Receta de Insumos</h3>
            <p className={styles.managerSubtitle}>Define qué materiales se consumirán del stock al realizar este servicio.</p>
        </div>
      </div>
      
      {/* --- ÁREA DE CARGA --- */}
      <div className={styles.addSection}>
        <div className={styles.inputGrid}>
            <div className={styles.selectWrapper}>
                <label className={styles.inputLabel}>Seleccionar Insumo</label>
                <select 
                    className={styles.nativeSelect}
                    value={seleccion} 
                    onChange={(e) => setSeleccion(e.target.value)}
                    disabled={loading}
                >
                    <option value="">-- Buscar en inventario --</option>
                    {disponibles.map(ins => (
                    <option key={ins.id} value={ins.id}>
                        {ins.nombre} ({ins.unidad}) — Stock: {ins.stock}
                    </option>
                    ))}
                </select>
            </div>

            <div style={{ maxWidth: '150px' }}>
                 <Input 
                    label={selectedInsumoData ? `Cant. (${selectedInsumoData.unidad})` : "Cantidad"}
                    type="number" 
                    value={cantidad} 
                    onChange={(e) => setCantidad(e.target.value)} 
                    placeholder="0.00"
                    min="0.01"
                    step="any"
                />
            </div>

            <div style={{ paddingTop: '24px' }}>
                <Button 
                    type="button" 
                    onClick={handleAdd} 
                    disabled={!seleccion || !cantidad || parseFloat(cantidad) <= 0}
                    icon={Plus}
                >
                    Añadir
                </Button>
            </div>
        </div>
        
        {selectedInsumoData && (
             <div className={styles.stockHint}>
                Stock disponible: <strong>{selectedInsumoData.stock} {selectedInsumoData.unidad}</strong>
             </div>
        )}
      </div>
      
      {error && (
        <div className={styles.alertBox}>
            <AlertCircle size={16}/>
            <span>{error}</span>
        </div>
      )}

      {/* --- LISTADO --- */}
      <div className={styles.listContainer}>
        {recetaActual.length > 0 ? (
          <table className={styles.recipeTable}>
            <thead>
              <tr>
                <th>Insumo</th>
                <th style={{textAlign: 'right'}}>Consumo por Turno</th>
                <th style={{width: 50}}></th>
              </tr>
            </thead>
            <tbody>
              {recetaActual.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className={styles.tableItemName}>
                        <Package size={16} className={styles.itemIcon} />
                        {item.insumo_nombre}
                    </div>
                  </td>
                  <td style={{textAlign: 'right', fontWeight: 600}}>
                    {item.cantidad_usada} <span className={styles.unitLabel}>{item.insumo_unidad}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button 
                      type="button"
                      className={styles.iconBtnDanger} 
                      onClick={() => handleRemove(item.insumo)}
                      title="Quitar de la receta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
            <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>
                    <FlaskConical size={24} />
                </div>
                <p>Aún no has agregado insumos a esta receta.</p>
                <span>Selecciona materiales arriba para calcular el costo y descontar stock automáticamente.</span>
            </div>
        )}
      </div>
    </div>
  );
};