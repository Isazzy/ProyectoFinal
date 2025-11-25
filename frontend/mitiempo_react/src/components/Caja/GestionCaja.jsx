// src/components/Caja/GestionCaja.jsx
import React from 'react';
import { useCaja } from '../../hooks/useCaja';
import AperturaCaja from './AperturaCaja';
import DashboardCaja from './DashboardCaja';

const GestionCaja = () => {
    const { 
        caja, 
        isOpen, 
        loading, 
        montoSugerido, 
        abrir, 
        cerrar, 
        refreshCaja 
    } = useCaja();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fb5b5b]"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            {!isOpen ? (
                <AperturaCaja 
                    montoSugerido={montoSugerido} 
                    onAbrir={abrir} 
                />
            ) : (
                <DashboardCaja 
                    caja={caja} 
                    onCerrar={cerrar}
                    onRefresh={refreshCaja}
                />
            )}
        </div>
    );
};

export default GestionCaja;