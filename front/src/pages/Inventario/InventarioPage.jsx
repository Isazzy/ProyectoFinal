import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Settings } from 'lucide-react'; // Agregamos Settings
import { InventarioList } from './InventarioList';
import { ProductosList } from './ProductosList';
import { CatalogosList } from './catalogosList'; // Asegúrate que el import coincida con tu archivo (mayúscula/minúscula)
import styles from '../../styles/Inventario.module.css';

export const InventarioPage = () => {
  const [activeTab, setActiveTab] = useState('insumos'); // 'insumos' | 'productos' | 'config'

  return (
    <div className={styles.pageContainer}>
      
      {/* --- BARRA DE PESTAÑAS --- */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'insumos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('insumos')}
        >
          <Package size={18} />
          <span>Insumos (Stock)</span>
        </button>
        
        <button 
          className={`${styles.tabBtn} ${activeTab === 'productos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          <ShoppingBag size={18} />
          <span>Productos (Venta)</span>
        </button>

        {/* Botón de Configuración AGREGADO */}
        <button 
          className={`${styles.tabBtn} ${activeTab === 'config' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>
      </div>

      {/* --- CONTENIDO DINÁMICO --- */}
      <div className={styles.tabContent}>
        
        {/* Pestaña Insumos */}
        {activeTab === 'insumos' && (
          <motion.div 
            key="insumos"
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InventarioList />
          </motion.div>
        )}

        {/* Pestaña Productos */}
        {activeTab === 'productos' && (
          <motion.div 
            key="productos"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ProductosList />
          </motion.div>
        )}

        {/* Pestaña Configuración (Catalogos) */}
        {activeTab === 'config' && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CatalogosList />
          </motion.div>
        )}

      </div>

    </div>
  );
};