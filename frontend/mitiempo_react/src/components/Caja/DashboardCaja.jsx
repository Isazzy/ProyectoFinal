// src/components/Caja/DashboardCaja.jsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// Card auxiliar para mantener el diseño limpio
const StatCard = ({ title, value, subtext, color = "gray", icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className={`text-2xl font-bold mt-1 text-${color}-600`}>${value}</h3>
            </div>
            {icon && <div className={`p-2 bg-${color}-50 rounded-lg text-${color}-500`}>{icon}</div>}
        </div>
        {subtext && <div className="text-xs text-gray-400 border-t pt-3 mt-1">{subtext}</div>}
    </div>
);

const DashboardCaja = ({ caja, onCerrar, onRefresh }) => {
    const [showCierreModal, setShowCierreModal] = useState(false);
    const [observacion, setObservacion] = useState('');

    const handleCierre = async () => {
        const success = await onCerrar(observacion);
        if (success) setShowCierreModal(false);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Control de Caja</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <p className="text-sm text-gray-600">
                            Abierta por: <strong>{caja.empleado?.first_name} {caja.empleado?.last_name}</strong> 
                            {' '} a las {new Date(caja.caja_fecha_hora_apertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onRefresh}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Actualizar Datos
                    </button>
                    <button 
                        onClick={() => setShowCierreModal(true)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium shadow-md"
                    >
                        Cerrar Caja
                    </button>
                </div>
            </header>

            {/* GRID DE ESTADISTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* CAJA EFECTIVO */}
                <div className="md:col-span-1">
                    <StatCard 
                        title="Saldo Efectivo (En Caja)"
                        value={caja.saldo_calculado_efectivo}
                        color="green"
                        subtext={
                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Inicio:</span> <span>${caja.caja_monto_inicial}</span></div>
                                <div className="flex justify-between text-green-600"><span>+ Ventas:</span> <span>${caja.total_ventas_efectivo}</span></div>
                                <div className="flex justify-between text-green-600"><span>+ Ingresos Man.:</span> <span>${caja.total_ingresos_manuales}</span></div>
                                <div className="flex justify-between text-red-500"><span>- Compras:</span> <span>${caja.total_compras_efectivo}</span></div>
                                <div className="flex justify-between text-red-500"><span>- Egresos Man.:</span> <span>${caja.total_egresos_manuales}</span></div>
                            </div>
                        }
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* CAJA DIGITAL */}
                <div className="md:col-span-1">
                    <StatCard 
                        title="Saldo Digital (Bancos)"
                        value={caja.saldo_calculado_transferencia}
                        color="blue"
                        subtext={
                            <div className="space-y-1">
                                <div className="flex justify-between text-blue-600"><span>+ Ventas Transf:</span> <span>${caja.total_ventas_transferencia}</span></div>
                                <div className="flex justify-between text-red-500"><span>- Compras Transf:</span> <span>${caja.total_compras_transferencia}</span></div>
                            </div>
                        }
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                    />
                </div>

                {/* VENTAS TOTALES */}
                <div className="md:col-span-1">
                    <StatCard 
                        title="Total Ventas Hoy"
                        value={(parseFloat(caja.total_ventas_efectivo) + parseFloat(caja.total_ventas_transferencia)).toFixed(2)}
                        color="pink"
                        subtext="Suma bruta de todas las ventas confirmadas."
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />
                </div>
            </div>

            {/* MODAL DE CIERRE */}
            {showCierreModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">Confirmar Cierre de Caja</h3>
                            <button onClick={() => setShowCierreModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <p className="text-sm text-yellow-700">
                                    El sistema registrará un saldo final de efectivo de: 
                                    <strong className="block text-lg">${caja.saldo_calculado_efectivo}</strong>
                                </p>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones (Opcional)
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                                rows="3"
                                placeholder="Ej: Todo cuadrado correctamente / Faltante de $50..."
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
                            <button 
                                onClick={() => setShowCierreModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCierre}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-sm"
                            >
                                Confirmar y Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCaja;