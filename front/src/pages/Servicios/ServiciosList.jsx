// ========================================
// src/pages/Servicios/ServiciosList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Plus, Edit, Trash2, Eye, Scissors, Search, Clock, 
    DollarSign, RefreshCw, EyeOff, Brush, Sparkles 
} from 'lucide-react';
import { useServicios } from '../../hooks/useServicios';
import { Card, Button, Badge, Input, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Servicios.module.css';
import { InsumoRecetaManager } from '../../pages/Servicios/InsumoRecetaManager';

// --- CONFIGURACIÓN DE CATEGORÍAS ---
const CATEGORIAS = [
    { id: 'Peluquería', label: 'Peluquería', icon: Scissors },
    { id: 'Uñas', label: 'Uñas', icon: Sparkles },
    { id: 'Maquillaje', label: 'Maquillaje', icon: Brush },
];

// --- SUB-COMPONENTE: FORMULARIO ---
const ServicioForm = ({ servicio, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    tipo_serv: servicio?.tipo_serv || "Peluquería", // Default
    nombre: servicio?.nombre || "",
    duracion: servicio?.duracion?.toString() || "",
    precio: servicio?.precio?.toString() || "",
    descripcion: servicio?.descripcion || "",
    dias_disponibles: servicio?.dias_disponibles || ["lunes", "martes", "miercoles", "jueves", "viernes"],
    activo: servicio?.activo ?? true,
  });

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

  // Handler exclusivo para categorías
  const handleCategorySelect = (catId) => {
      setForm(prev => ({ ...prev, tipo_serv: catId }));
  };

  const validate = () => {
    const e = {};
    if (!form.tipo_serv) e.tipo_serv = "Requerido";
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.duracion || parseInt(form.duracion) <= 0) e.duracion = "Inválido";
    if (!form.precio || parseFloat(form.precio) <= 0) e.precio = "Inválido";
    if (form.dias_disponibles.length === 0) e.dias_disponibles = "Seleccione 1 día mín.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const recetaPayload = receta.map(item => ({
      insumo_id: item.insumo || item.id, 
      cantidad_usada: parseFloat(item.cantidad_usada || item.cantidad)
    }));

    onSubmit({
      ...form,
      duracion: parseInt(form.duracion),
      precio: parseFloat(form.precio),
      receta: recetaPayload,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Sección Principal */}
        <div className={styles.formSection}>
            
            {/* SELECCIÓN DE CATEGORÍA POR SLOTS */}
            <div className={styles.inputGroup}>
                <label className={styles.sectionLabel}>Categoría *</label>
                <div className={styles.categoryGrid}>
                    {CATEGORIAS.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`${styles.categorySlot} ${form.tipo_serv === cat.id ? styles.catActive : ''}`}
                            onClick={() => handleCategorySelect(cat.id)}
                        >
                            <cat.icon size={18} />
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
                {errors.tipo_serv && <span className={styles.errorText}>{errors.tipo_serv}</span>}
            </div>

            <Input label="Nombre del Servicio *" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} />
            
            <div className={styles.row2}>
                <Input label="Duración (min) *" type="number" name="duracion" value={form.duracion} onChange={handleChange} error={errors.duracion} startIcon={Clock} />
                <Input label="Precio *" type="number" name="precio" value={form.precio} onChange={handleChange} error={errors.precio} startIcon={DollarSign} />
            </div>

            <div className={styles.inputGroup}>
                <label>Descripción</label>
                <textarea className={styles.textarea} name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} />
            </div>
        </div>

        {/* Sección Disponibilidad */}
        <div className={styles.formSection}>
            <label className={styles.sectionLabel}>Días Disponibles</label>
            <div className={styles.daysGrid}>
                {diasSemana.map(dia => (
                <label key={dia} className={`${styles.dayChip} ${form.dias_disponibles.includes(dia) ? styles.dayActive : ''}`}>
                    <input type="checkbox" checked={form.dias_disponibles.includes(dia)} onChange={() => toggleDia(dia)} hidden />
                    {dia.charAt(0).toUpperCase() + dia.slice(1, 3)}
                </label>
                ))}
            </div>
            {errors.dias_disponibles && <span className={styles.errorText}>{errors.dias_disponibles}</span>}
        </div>

        {/* Sección Insumos (Receta) */}
        <div className={styles.formSection}>
             <InsumoRecetaManager 
                recetaActual={receta} 
                setRecetaActual={setReceta} 
                error={errors.receta}
            />
        </div>

        {/* Footer y Activo */}
        <div className={styles.formFooter}>
            <div className={styles.switchGroup}>
                <input type="checkbox" id="activoSwitch" name="activo" checked={form.activo} onChange={handleChange} />
                <label htmlFor="activoSwitch">Servicio Activo</label>
            </div>

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" loading={loading}>{servicio ? "Guardar Cambios" : "Crear Servicio"}</Button>
            </div>
        </div>
    </form>
  );
};


// ===============================
// VISTA PRINCIPAL
// ===============================
export const ServiciosList = () => {
  const navigate = useNavigate();
  const { servicios, loading, fetchServicios, crearServicio, actualizarServicio, eliminarServicio } = useServicios();
  
  const [search, setSearch] = useState("");
  const [filterActivo, setFilterActivo] = useState("todos"); // 'todos', 'activo', 'inactivo'
  const [modal, setModal] = useState({ open: false, servicio: null });

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  const filteredServicios = servicios.filter(s => {
    const matchesSearch = s.nombre.toLowerCase().includes(search.toLowerCase()) || s.tipo_serv.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterActivo === "todos" || (filterActivo === "activo" && s.activo) || (filterActivo === "inactivo" && !s.activo);
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (data) => {
    let success = false;
    if (modal.servicio) {
      success = await actualizarServicio(modal.servicio.id_serv, data);
    } else {
      success = await crearServicio(data);
    }
    if (success) setModal({ open: false, servicio: null });
  };

  const handleDelete = async (servicio) => {
      if(window.confirm(`¿Eliminar ${servicio.nombre}?`)) {
         await eliminarServicio(servicio.id_serv);
      }
  };

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div>
            <h1 className={styles.title}>Servicios</h1>
            <p className={styles.subtitle}>Catálogo de tratamientos y precios</p>
        </div>
        <Button icon={Plus} onClick={() => setModal({ open: true, servicio: null })}>Nuevo Servicio</Button>
      </header>

      {/* FILTROS */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
            <Input 
                placeholder="Buscar servicio..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                icon={Search} 
            />
        </div>
        <div className={styles.filterTabs}>
             {['todos', 'activo', 'inactivo'].map(filter => (
                 <button 
                    key={filter}
                    className={`${styles.tabBtn} ${filterActivo === filter ? styles.tabActive : ''}`}
                    onClick={() => setFilterActivo(filter)}
                 >
                     {filter.charAt(0).toUpperCase() + filter.slice(1)}
                 </button>
             ))}
        </div>
      </div>

      {/* GRID DE TARJETAS */}
      {loading ? (
          <div className={styles.loading}><RefreshCw className="animate-spin"/> Cargando catálogo...</div>
      ) : (
          filteredServicios.length > 0 ? (
            <div className={styles.grid}>
                {filteredServicios.map(servicio => (
                    <motion.div 
                        key={servicio.id_serv} 
                        className={`${styles.card} ${!servicio.activo ? styles.cardInactive : ''}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                {servicio.tipo_serv === 'Uñas' ? <Sparkles size={20}/> : 
                                 servicio.tipo_serv === 'Maquillaje' ? <Brush size={20}/> : 
                                 <Scissors size={20} />}
                            </div>
                            <div className={styles.headerInfo}>
                                <h3>{servicio.nombre}</h3>
                                <span className={styles.categoryTag}>{servicio.tipo_serv}</span>
                            </div>
                            {!servicio.activo && <Badge variant="secondary" size="sm" icon={EyeOff}>Inactivo</Badge>}
                        </div>

                        <div className={styles.cardBody}>
                             <div className={styles.metaRow}>
                                 <span className={styles.metaItem}><Clock size={14}/> {servicio.duracion} min</span>
                                 <span className={styles.priceTag}>{formatCurrency(servicio.precio)}</span>
                             </div>
                             <p className={styles.description}>
                                 {servicio.descripcion || "Sin descripción disponible."}
                             </p>
                        </div>

                        <div className={styles.cardFooter}>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/servicios/${servicio.id_serv}`)}>
                                <Eye size={16} />
                            </Button>
                            <div className={styles.dividerVertical}></div>
                            <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, servicio })}>
                                <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className={styles.dangerBtn} onClick={() => handleDelete(servicio)}>
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
                <Scissors size={48} />
                <p>No se encontraron servicios.</p>
            </div>
          )
      )}

      {/* MODAL */}
      <Modal 
        isOpen={modal.open} 
        onClose={() => setModal({ open: false, servicio: null })} 
        title={modal.servicio ? "Editar Servicio" : "Nuevo Servicio"}
      >
        <ServicioForm 
            servicio={modal.servicio} 
            onSubmit={handleSubmit} 
            onCancel={() => setModal({ open: false, servicio: null })} 
            loading={loading} 
        />
      </Modal>

    </motion.div>
  );
};