// src/components/Compras/ComprasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';

const ComprasList = () => {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCompras();
    }, []);

    const cargarCompras = async () => {
        try {
            const response = await api.get('/compras/');
            setCompras(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar historial de compras");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Compras a Proveedores</h1>
                    <p className="text-sm text-gray-500">Historial de reposición de stock y gastos</p>
                </div>
                <Link 
                    to="/admin/dashboard/compras/create" 
                    className="bg-[#fb5b5b] hover:bg-[#e04a4a] text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
                >
                    <span>＋</span> Registrar Nueva Compra
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-semibold">ID</th>
                                <th className="px-6 py-3 font-semibold">Fecha</th>
                                <th className="px-6 py-3 font-semibold">Proveedor</th>
                                <th className="px-6 py-3 font-semibold">Método Pago</th>
                                <th className="px-6 py-3 font-semibold">Responsable</th>
                                <th className="px-6 py-3 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                            ) : compras.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay compras registradas aún.</td></tr>
                            ) : compras.map((compra) => (
                                <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{compra.id}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(compra.fecha_hora).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-medium">
                                        {compra.proveedor}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                            compra.metodo_pago === 'efectivo' 
                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {compra.metodo_pago.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {compra.empleado?.first_name || 'Usuario'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                                        ${parseFloat(compra.total).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComprasList;