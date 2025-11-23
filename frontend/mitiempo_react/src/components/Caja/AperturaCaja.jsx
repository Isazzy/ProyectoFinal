// src/components/Caja/AperturaCaja.jsx
import React, { useState } from 'react';

const AperturaCaja = ({ montoSugerido, onAbrir }) => {
    const [monto, setMonto] = useState(montoSugerido || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAbrir(monto);
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
                {/* Header decorativo */}
                <div className="bg-[#fb5b5b] p-6 text-center">
                    <h2 className="text-2xl font-bold text-white">Iniciar Turno</h2>
                    <p className="text-white/80 text-sm">Apertura de Caja</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 text-center">
                            <span className="block text-gray-500 text-sm mb-2">Saldo cierre anterior (Sugerido)</span>
                            <div className="text-3xl font-bold text-gray-700">
                                ${parseFloat(montoSugerido).toFixed(2)}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Monto Inicial Real
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#fb5b5b] focus:border-transparent transition-all outline-none"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Ingrese el dinero físico que cuenta en la caja al iniciar.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#fb5b5b] hover:bg-[#e04a4a] text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            Abrir Caja
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AperturaCaja;