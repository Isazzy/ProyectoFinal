// ========================================
// src/pages/Servicios/ServicioDetail.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit, Package, Plus } from 'lucide-react';
import { serviciosApi } from '../../api/serviciosApi';
import { Card, Button, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/ServicioDetail.module.css';

export const ServicioDetail = () => {
  const { id } = useParams(); // URL param (ej: /servicios/5)
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Cargando...</div>;
  if (!servicio) return <div>Servicio no encontrado</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <button onClick={() => navigate('/servicios')} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{servicio.nombre}</h1>
          <Badge variant={servicio.activo ? 'success' : 'default'}>
            {servicio.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <Button icon={Edit} variant="outline">Editar</Button>
      </header>

      <div className={styles.grid}>
        <Card>
          <h2>Información</h2>
          <div className={styles.infoGrid}>
            <div>
              <label>Duración</label>
              <p>{servicio.duracion} minutos</p>
            </div>
            <div>
              <label>Precio</label>
              <p className={styles.price}>{formatCurrency(servicio.precio)}</p>
            </div>
            <div>
              <label>Categoría</label>
              <p>{servicio.tipo_serv}</p>
            </div>
          </div>
          {servicio.descripcion && (
            <div className={styles.description}>
              <label>Descripción</label>
              <p>{servicio.descripcion}</p>
            </div>
          )}
        </Card>

        <Card>
          <div className={styles.cardHeader}>
            <h2><Package size={20} /> Receta de Insumos</h2>
            <Button size="sm" icon={Plus} variant="outline">Agregar</Button>
          </div>
          
          {/* IMPORTANTE: Tu serializer devuelve 'receta', no 'insumos'.
            Los campos son planos: insumo_nombre, cantidad_usada, insumo_unidad.
          */}
          {servicio.receta && servicio.receta.length > 0 ? (
            <div className={styles.insumosList}>
              {servicio.receta.map((item) => (
                <div key={item.id} className={styles.insumoItem}>
                  <span>{item.insumo_nombre}</span>
                  <span>{parseFloat(item.cantidad_usada)} {item.insumo_unidad}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>No hay insumos asociados</p>
          )}
        </Card>
      </div>
    </motion.div>
  );
};