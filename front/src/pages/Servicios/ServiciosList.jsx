// ========================================
// src/pages/Servicios/ServiciosList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Scissors, Search } from 'lucide-react';
import { useServicios } from '../../hooks/useServicios';
import { Card, Button, Badge, Input, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Servicios.module.css';
import { InsumoRecetaManager } from '../../pages/Servicios/InsumoRecetaManager'; // o ruta correcta


// ===============================
// FORMULARIO DEL SERVICIO
// ===============================
const ServicioForm = ({ servicio, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    tipo_serv: servicio?.tipo_serv || "",
    nombre: servicio?.nombre || "",
    duracion: servicio?.duracion?.toString() || "",
    precio: servicio?.precio?.toString() || "",
    descripcion: servicio?.descripcion || "",
    dias_disponibles: servicio?.dias_disponibles || ["lunes"],
    activo: servicio?.activo ?? true, // Correcto: 'activo'
  });

  // Si viene del backend, 'servicio.receta' trae [{insumo: 1, insumo_nombre: 'x', ...}]
  const [receta, setReceta] = useState(servicio?.receta || []);

  const [errors, setErrors] = useState({});

  const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

  const toggleDia = (dia) => {
    setForm(prev => {
      const existe = prev.dias_disponibles.includes(dia);
      return {
        ...prev,
        dias_disponibles: existe
          ? prev.dias_disponibles.filter(d => d !== dia)
          : [...prev.dias_disponibles, dia],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.tipo_serv.trim()) e.tipo_serv = "Tipo requerido";
    if (!form.nombre.trim()) e.nombre = "Nombre requerido";
    if (!form.duracion || parseInt(form.duracion) <= 0) e.duracion = "Duración inválida";
    if (!form.precio || parseFloat(form.precio) <= 0) e.precio = "Precio inválido";
    if (form.dias_disponibles.length === 0) e.dias_disponibles = "Seleccione al menos 1 día";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Preparamos la receta en el formato que espera el Serializer de Escritura (ServicioInsumoWriteSerializer)
    // Espera: { insumo_id: int, cantidad_usada: decimal }
    const recetaPayload = receta.map(item => ({
      insumo_id: item.insumo, // 'insumo' es el ID en el objeto que viene del serializer de lectura o del manager
      cantidad_usada: item.cantidad_usada
    }));

    onSubmit({
      ...form,
      duracion: parseInt(form.duracion),
      precio: form.precio,
      receta: recetaPayload, // Se envía como string o number según convenga
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input label="Tipo de servicio" name="tipo_serv" value={form.tipo_serv} onChange={handleChange} error={errors.tipo_serv} required />
      <Input label="Nombre del servicio" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} required />
      <div className={styles.formRow}>
        <Input label="Duración (min)" type="number" name="duracion" value={form.duracion} onChange={handleChange} error={errors.duracion} required />
        <Input label="Precio" type="text" name="precio" value={form.precio} onChange={handleChange} error={errors.precio} required />
      </div>

      <label>Días disponibles</label>
      <div className={styles.daysGroup}>
        {diasSemana.map(dia => (
          <label key={dia} className={styles.dayItem}>
            <input type="checkbox" checked={form.dias_disponibles.includes(dia)} onChange={() => toggleDia(dia)} />
            {dia}
          </label>
        ))}
      </div>
      {errors.dias_disponibles && <p className={styles.error}>{errors.dias_disponibles}</p>}

        <InsumoRecetaManager 
        recetaActual={receta} 
        setRecetaActual={setReceta} 
        error={errors.receta} // Puedes agregar validación de receta si quieres
      />

      <div className={styles.textareaGroup}>
        <label>Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} />
      </div>

      <div className={styles.checkboxGroup}>
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
        <label>Servicio activo</label>
      </div>

      <div className={styles.formActions}>
        <Button type="submit" loading={loading}>{servicio ? "Guardar cambios" : "Crear servicio"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

// ===============================
// LISTA DE SERVICIOS
// ===============================
export const ServiciosList = () => {
  const navigate = useNavigate();
  const { servicios, loading, fetchServicios, crearServicio, actualizarServicio, eliminarServicio } = useServicios();
  const [search, setSearch] = useState("");
  const [filterActivo, setFilterActivo] = useState("todos");
  const [modal, setModal] = useState({ open: false, servicio: null });

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  const filteredServicios = servicios.filter(s => {
    const matchesSearch = s.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterActivo === "todos" || (filterActivo === "activo" && s.activo) || (filterActivo === "inactivo" && !s.activo);
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (data) => {
    if (modal.servicio) {
      // Usamos id_serv explícitamente
      await actualizarServicio(modal.servicio.id_serv, data);
    } else {
      await crearServicio(data);
    }
    setModal({ open: false, servicio: null });
  };

  const handleDelete = async (servicio) => {
    // Usamos id_serv explícitamente
    await eliminarServicio(servicio.id_serv, servicio.nombre);
  };

  return (
    <motion.div className={styles.serviciosPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <h1 className={styles.title}>Servicios</h1>
        <Button icon={Plus} onClick={() => setModal({ open: true, servicio: null })}>Nuevo Servicio</Button>
      </header>

      <div className={styles.filters}>
        <Input placeholder="Buscar servicio..." value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
        <div className={styles.filterButtons}>
          {["todos", "activo", "inactivo"].map(filter => (
            <button key={filter} className={`${styles.filterBtn} ${filterActivo === filter ? styles.active : ""}`} onClick={() => setFilterActivo(filter)}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {!loading && filteredServicios.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Duración</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredServicios.map(servicio => (
                  <motion.tr key={servicio.id_serv} whileHover={{ opacity: 0.8 }}>
                    <td>
                      <div className={styles.servicioName}><Scissors size={20} />{servicio.nombre}</div>
                    </td>
                    <td>{servicio.duracion} min</td>
                    <td>{formatCurrency(servicio.precio)}</td>
                    <td>
                      <Badge variant={servicio.activo ? "success" : "default"}>{servicio.activo ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className={styles.actions}>
                      <button onClick={() => navigate(`/servicios/${servicio.id_serv}`)}><Eye size={18} /></button>
                      <button onClick={() => setModal({ open: true, servicio })}><Edit size={18} /></button>
                      <button className={styles.dangerBtn} onClick={() => handleDelete(servicio)}><Trash2 size={18} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay servicios.</p>
        )}
      </Card>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, servicio: null })} title={modal.servicio ? "Editar Servicio" : "Nuevo Servicio"}>
        <ServicioForm servicio={modal.servicio} onSubmit={handleSubmit} onCancel={() => setModal({ open: false, servicio: null })} loading={loading} />
      </Modal>
    </motion.div>
  );
};