import React, { useState } from 'react';
import { useCaja } from '../hooks/useCaja';
// Importa tus componentes de UI (Botones, Inputs, Cards, Tablas)

const GestionCaja = () => {
    const { caja, isOpen, loading, montoSugerido, abrir, cerrar } = useCaja();
    
    // Estados locales para formularios
    const [observacionCierre, setObservacionCierre] = useState('');
    const [montoInicialInput, setMontoInicialInput] = useState('');

    if (loading) return <div className="p-10 text-center">Cargando estado de caja...</div>;

    // --- VISTA: CAJA CERRADA (Formulario de Apertura) ---
    if (!isOpen) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-pink-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Apertura de Caja</h2>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">Saldo de cierre anterior (Sugerido):</p>
                    <p className="text-3xl font-bold text-blue-600">${montoSugerido}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial</label>
                    <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder={montoSugerido}
                        value={montoInicialInput}
                        onChange={(e) => setMontoInicialInput(e.target.value)}
                        // Nota: Tu backend usa el monto sugerido automáticamente si existe una caja previa,
                        // pero dejamos el input habilitado por si es la primera vez o quieres forzar lógica visual.
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        * El sistema tomará el saldo anterior automáticamente para la continuidad de caja.
                    </p>
                </div>

                <button 
                    onClick={() => abrir(montoInicialInput || montoSugerido)}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                    Abrir Caja
                </button>
            </div>
        );
    }

    // --- VISTA: CAJA ABIERTA (Dashboard) ---
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Control de Caja</h1>
                    <p className="text-green-600 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
                        Caja Abierta desde: {new Date(caja.caja_fecha_hora_apertura).toLocaleTimeString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Responsable</p>
                    <p className="font-medium">{caja.empleado.first_name} {caja.empleado.last_name}</p>
                </div>
            </header>

            {/* GRID DE RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Tarjeta Efectivo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Saldo Calculado (Efectivo)</h3>
                    <p className="text-3xl font-bold text-gray-800">${caja.saldo_calculado_efectivo}</p>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between"><span>Inicial:</span> <span>${caja.caja_monto_inicial}</span></div>
                        <div className="flex justify-between text-green-600"><span>+ Ventas:</span> <span>${caja.total_ventas_efectivo}</span></div>
                        <div className="flex justify-between text-green-600"><span>+ Ingresos:</span> <span>${caja.total_ingresos_manuales}</span></div>
                        <div className="flex justify-between text-red-500"><span>- Compras:</span> <span>${caja.total_compras_efectivo}</span></div>
                        <div className="flex justify-between text-red-500"><span>- Egresos:</span> <span>${caja.total_egresos_manuales}</span></div>
                    </div>
                </div>

                {/* Tarjeta Transferencias */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Saldo Digital (Transf/MP)</h3>
                    <p className="text-3xl font-bold text-indigo-600">${caja.saldo_calculado_transferencia}</p>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between text-green-600"><span>+ Ventas:</span> <span>${caja.total_ventas_transferencia}</span></div>
                        <div className="flex justify-between text-red-500"><span>- Compras:</span> <span>${caja.total_compras_transferencia}</span></div>
                    </div>
                </div>

                {/* Panel de Cierre */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <h3 className="text-red-800 text-lg font-bold mb-4">Cierre de Caja</h3>
                    <textarea
                        className="w-full p-3 text-sm border border-red-200 rounded-lg mb-4 bg-white"
                        rows="3"
                        placeholder="Observaciones del cierre (ej: faltante de $100, todo ok...)"
                        value={observacionCierre}
                        onChange={(e) => setObservacionCierre(e.target.value)}
                    ></textarea>
                    <button 
                        onClick={() => cerrar(observacionCierre)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        Cerrar Caja y Generar Reporte
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GestionCaja;