import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { serviciosApi } from '../../api/serviciosApi'; // Ajusta la ruta según tu estructura
import { Button, Input } from '../../components/ui'; // Ajusta según tus componentes base
import styles from '../../styles/Servicios.module.css'; // Usando tus estilos existentes

export const InsumoRecetaManager = ({ recetaActual, setRecetaActual, error }) => {
  const [disponibles, setDisponibles] = useState([]);
  const [seleccion, setSeleccion] = useState(""); // ID del insumo seleccionado
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar insumos al montar el componente
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
    if (!seleccion || !cantidad || parseFloat(cantidad) <= 0) return;

    // Buscar el objeto completo del insumo seleccionado para mostrar nombre/unidad
    const insumoObj = disponibles.find(d => d.id === parseInt(seleccion));
    if (!insumoObj) return;

    // Verificar si ya existe en la receta para no duplicar (opcional, o sumar cantidad)
    const existe = recetaActual.find(r => r.insumo === insumoObj.id);
    if (existe) {
      alert("Este insumo ya está en la receta. Elimínalo para corregir la cantidad.");
      return;
    }

    const nuevoItem = {
      // Estructura interna temporal para el frontend
      insumo: insumoObj.id, // ID para el backend
      insumo_nombre: insumoObj.nombre, // Para mostrar en tabla
      insumo_unidad: insumoObj.unidad, // Para mostrar en tabla
      cantidad_usada: parseFloat(cantidad) // Valor
    };

    setRecetaActual([...recetaActual, nuevoItem]);
    
    // Resetear inputs
    setSeleccion("");
    setCantidad("");
  };

  const handleRemove = (insumoId) => {
    setRecetaActual(recetaActual.filter(item => item.insumo !== insumoId));
  };

  return (
    <div className={styles.recetaContainer} style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Receta de Insumos (Costo)</h3>
      
      {/* Selector y Input de Agregar */}
      <div className={styles.formRow} style={{ alignItems: 'flex-end', gap: '10px' }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Insumo</label>
          <select 
            className={styles.input} // Usando tus clases de estilo si aplican
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            value={seleccion} 
            onChange={(e) => setSeleccion(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Seleccionar Insumo --</option>
            {disponibles.map(ins => (
              <option key={ins.id} value={ins.id}>
                {ins.nombre} ({ins.unidad}) - Stock: {ins.stock}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <Input 
            label="Cantidad" 
            type="number" 
            value={cantidad} 
            onChange={(e) => setCantidad(e.target.value)} 
            placeholder="0.00"
          />
        </div>

        <Button type="button" onClick={handleAdd} disabled={!seleccion || !cantidad}>
          <Plus size={18} />
        </Button>
      </div>
      
      {error && <p className={styles.error}>{error}</p>}

      {/* Tabla de Items Agregados */}
      {recetaActual.length > 0 && (
        <div className={styles.tableWrapper} style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
          <table className={styles.table} style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recetaActual.map((item, index) => (
                <tr key={index}>
                  <td>{item.insumo_nombre}</td>
                  <td>{item.cantidad_usada} {item.insumo_unidad}</td>
                  <td>
                    <button 
                      type="button"
                      className={styles.dangerBtn} 
                      onClick={() => handleRemove(item.insumo)}
                      style={{ padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};