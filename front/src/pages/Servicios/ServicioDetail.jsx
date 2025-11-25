import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Edit, Package, Clock, DollarSign, 
    Tag, FileText, Beaker, CheckCircle, XCircle 
} from 'lucide-react';
import { serviciosApi } from '../../api/serviciosApi';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/ServicioDetail.module.css';

// (Opcional: Si quieres reutilizar el Formulario de Edición aquí, impórtalo)
// import { ServicioForm } from './ServiciosList'; 

export const ServicioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de edición si decides integrarlo aquí
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const data = await serviciosApi.getServicio(id);
        setServicio(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicio();
  }, [id]);

  if (loading) return <div className={styles.loading}>Cargando servicio...</div>;
  if (!servicio) return <div className={styles.error}>Servicio no encontrado</div>;

  const isActive = servicio.activo;

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/servicios')}>
            Volver al catálogo
        </Button>
        <div className={styles.headerTitle}>
            <h1>{servicio.nombre}</h1>
            <Badge variant={isActive ? 'success' : 'secondary'} icon={isActive ? CheckCircle : XCircle}>
                {isActive ? 'Activo' : 'Inactivo'}
            </Badge>
        </div>
      </header>

      <div className={styles.contentGrid}>

        {/* --- COLUMNA IZQUIERDA (Contenido Rico) --- */}
        <div className={styles.leftColumn}>
            
            {/* DESCRIPCIÓN */}
            <Card className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}><FileText size={20}/> Descripción</h2>
                </div>
                <p className={styles.descriptionText}>
                    {servicio.descripcion || "No se ha proporcionado una descripción detallada para este servicio."}
                </p>
            </Card>

            {/* RECETA DE INSUMOS */}
            <Card className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}><Beaker size={20}/> Receta de Insumos</h2>
                    <span className={styles.cardSubtitle}>Materiales que se descuentan del stock al realizar este servicio.</span>
                </div>

                {servicio.receta && servicio.receta.length > 0 ? (
                    <div className={styles.recipeList}>
                        {servicio.receta.map((item) => (
                            <div key={item.id} className={styles.recipeItem}>
                                <div className={styles.recipeIcon}>
                                    <Package size={16} />
                                </div>
                                <div className={styles.recipeInfo}>
                                    <span className={styles.recipeName}>{item.insumo_nombre}</span>
                                    <span className={styles.recipeStock}>Disponible en stock: {parseFloat(item.insumo_stock)} {item.insumo_unidad}</span>
                                </div>
                                <div className={styles.recipeQuantity}>
                                    <strong>{parseFloat(item.cantidad_usada)}</strong>
                                    <span className={styles.unit}>{item.insumo_unidad}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Package size={40} />
                        <p>Este servicio no consume insumos registrados.</p>
                    </div>
                )}
            </Card>
        </div>

        {/* --- COLUMNA DERECHA (Datos Duros Sticky) --- */}
        <div className={styles.rightColumn}>
            <Card className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Detalles Técnicos</h3>
                
                <div className={styles.summaryRow}>
                    <div className={styles.iconBox}><Tag size={18}/></div>
                    <div>
                        <span className={styles.label}>Categoría</span>
                        <p className={styles.value}>{servicio.tipo_serv}</p>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.summaryRow}>
                    <div className={styles.iconBox}><Clock size={18}/></div>
                    <div>
                        <span className={styles.label}>Duración Estimada</span>
                        <p className={styles.value}>{servicio.duracion} minutos</p>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.summaryRow}>
                    <div className={styles.iconBox} style={{color: '#16a34a', background: '#dcfce7'}}><DollarSign size={18}/></div>
                    <div>
                        <span className={styles.label}>Precio al Público</span>
                        <p className={styles.priceValue}>{formatCurrency(servicio.precio)}</p>
                    </div>
                </div>
                {/*
                <div className={styles.actions}>
                    {/* Aquí podrías abrir el Modal de Edición reutilizando el de ServiciosList
                    <Button fullWidth icon={Edit} onClick={() => setIsEditing(true)}>
                        Editar Servicio
                    </Button>
                </div>
                 */}
            </Card>

            {/* Card de Disponibilidad (Opcional, solo visualización) */}
            <Card className={styles.availabilityCard}>
                <h4>Días Disponibles</h4>
                <div className={styles.daysTags}>
                    {servicio.dias_disponibles && servicio.dias_disponibles.length > 0 ? (
                        servicio.dias_disponibles.map(dia => (
                            <span key={dia} className={styles.dayTag}>
                                {dia.charAt(0).toUpperCase() + dia.slice(1)}
                            </span>
                        ))
                    ) : (
                        <span className={styles.noDays}>No configurado</span>
                    )}
                </div>
            </Card>
        </div>

      </div>

      {/* TODO: Integrar Modal de Edición aquí si se desea editar desde el detalle */}
      {/* {isEditing && <Modal ... > <ServicioForm ... /> </Modal>} */}

    </motion.div>
  );
};