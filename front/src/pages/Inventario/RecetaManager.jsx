import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import styles from '../../styles/Inventario.module.css'; // Reutiliza estilos

export const RecetaManager = ({ receta, setReceta, insumosDisponibles }) => {
  const [selectedInsumo, setSelectedInsumo] = useState("");
  const [cantidad, setCantidad] = useState("");

  const handleAdd = () => {
    if (!selectedInsumo || !cantidad) return;
    
    // Evitar duplicados
    if (receta.find(item => item.insumo_id === parseInt(selectedInsumo))) {
        alert("El insumo ya está en la receta");
        return;
    }

    const insumoObj = insumosDisponibles.find(i => i.id === parseInt(selectedInsumo));
    
    const nuevoItem = {
        insumo_id: parseInt(selectedInsumo),
        cantidad: parseFloat(cantidad),
        // Datos extra solo para visualizar en la tabla (no se envían al back en el JSON final)
        nombre: insumoObj?.insumo_nombre,
        unidad: insumoObj?.insumo_unidad
    };

    setReceta([...receta, nuevoItem]);
    setSelectedInsumo("");
    setCantidad("");
  };

  const handleRemove = (id) => {
    setReceta(receta.filter(item => item.insumo_id !== id));
  };

  return (
    <div style={{ marginTop: 15, border: '1px solid #e5e7eb', padding: 10, borderRadius: 8 }}>
      <h4 style={{ fontSize: '0.9rem', marginBottom: 10, fontWeight: 600 }}>Receta (Consumo de Stock)</h4>
      
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 10 }}>
        <div style={{ flex: 2 }}>
            <label style={{ fontSize: '0.8rem' }}>Insumo</label>
            <select 
                className={styles.selectInput}
                value={selectedInsumo}
                onChange={(e) => setSelectedInsumo(e.target.value)}
            >
                <option value="">Seleccionar...</option>
                {insumosDisponibles.map(ins => (
                    <option key={ins.id} value={ins.id}>
                        {ins.insumo_nombre} ({ins.insumo_unidad})
                    </option>
                ))}
            </select>
        </div>
        <div style={{ flex: 1 }}>
            <Input 
                label="Cant." 
                type="number" 
                value={cantidad} 
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0.00"
            />
        </div>
        <Button type="button" size="sm" onClick={handleAdd} disabled={!selectedInsumo || !cantidad}>
            <Plus size={16} />
        </Button>
      </div>

      {receta.length > 0 && (
        <table className={styles.table} style={{ fontSize: '0.85rem' }}>
            <thead>
                <tr>
                    <th>Insumo</th>
                    <th>Cant.</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {receta.map((item, idx) => (
                    <tr key={idx}>
                        <td>{item.nombre || `Insumo #${item.insumo_id}`}</td>
                        <td>{item.cantidad} {item.unidad}</td>
                        <td style={{textAlign: 'right'}}>
                            <button type="button" onClick={() => handleRemove(item.insumo_id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>
                                <Trash2 size={14} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      )}
    </div>
  );
};