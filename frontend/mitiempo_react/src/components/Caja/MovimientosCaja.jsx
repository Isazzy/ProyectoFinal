// src/components/Caja/MovimientosCaja.jsx
import React, { useState, useEffect } from 'react';
import { movimientosAPI } from '../../api/MovimientoCaja';
import { toast } from 'react-hot-toast';

const MovimientosCaja = () => {
    const [activeTab, setActiveTab] = useState('ingresos'); // 'ingresos' | 'egresos'
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Formulario
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = activeTab === 'ingresos' 
                ? await movimientosAPI.getIngresos() 
                : await movimientosAPI.getEgresos();
            setMovimientos(data);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando movimientos. ¿Hay caja abierta?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!monto || !descripcion) return toast.error("Complete todos los campos");

        setSubmitting(true);
        try {
            const payload = activeTab === 'ingresos' 
                ? { ingreso_descripcion: descripcion, ingreso_monto: monto }
                : { egreso_descripcion: descripcion, egreso_monto: monto };

            if (activeTab === 'ingresos') await movimientosAPI.createIngreso(payload);
            else await movimientosAPI.createEgreso(payload);

            toast.success("Movimiento registrado exitosamente");
            setMonto('');
            setDescripcion('');
            fetchData(); // Recargar tabla
        } catch (error) {
            toast.error("Error al registrar. Verifique que la caja esté abierta.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Control de Movimientos</h2>

            {/* TABS */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                <button
                    onClick={() => setActiveTab('ingresos')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'ingresos' 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Ingresos
                </button>
                <button
                    onClick={() => setActiveTab('egresos')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'egresos' 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Egresos
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORMULARIO DE CARGA */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            {activeTab === 'ingresos' ? (
                                <span className="text-green-500 text-xl">＋</span> 
                            ) : (
                                <span className="text-red-500 text-xl">－</span>
                            )}
                            Nuevo {activeTab === 'ingresos' ? 'Ingreso' : 'Egreso'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Monto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-3 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                    placeholder="0.00"
                                    value={monto}
                                    onChange={e => setMonto(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-3 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder={`Ej: ${activeTab === 'ingresos' ? 'Aporte de socio' : 'Pago de limpieza'}`}
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 px-4 rounded-lg text-white font-bold shadow-md transition-transform active:scale-95 ${
                                    activeTab === 'ingresos' 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : 'bg-red-500 hover:bg-red-600'
                                } disabled:opacity-50`}
                            >
                                {submitting ? 'Guardando...' : 'Registrar Movimiento'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* LISTA DE MOVIMIENTOS */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Historial de {activeTab} (Sesión Actual)</h3>
                        </div>
                        
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Cargando...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Hora</th>
                                            <th className="px-6 py-3 font-medium">Tipo</th>
                                            <th className="px-6 py-3 font-medium">Descripción</th>
                                            <th className="px-6 py-3 font-medium text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {movimientos.length > 0 ? movimientos.map((mov, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(mov.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        mov.tipo === 'Venta' || mov.tipo === 'Ingreso' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {mov.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 font-medium">
                                                    {mov.descripcion}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    ${parseFloat(mov.monto).toFixed(2)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                                    No hay movimientos registrados en esta sesión.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovimientosCaja;