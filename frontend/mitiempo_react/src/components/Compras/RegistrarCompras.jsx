// src/components/Compras/RegistrarCompra.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { productosAPI } from '../../api/productos'; // Asegúrate de tener este export
import { toast } from 'react-hot-toast';

const RegistrarCompra = () => {
    const navigate = useNavigate();
    
    // --- ESTADOS DE DATOS ---
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    
    // --- ESTADO DEL FORMULARIO ---
    const [proveedorId, setProveedorId] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [carritoCompra, setCarritoCompra] = useState([]);
    
    // --- ESTADO DE LA LÍNEA ACTUAL (Producto a agregar) ---
    const [itemSeleccionado, setItemSeleccionado] = useState(''); // ID del producto
    const [cantidad, setCantidad] = useState(1);
    const [costoUnitario, setCostoUnitario] = useState('');
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // Cargar proveedores y productos en paralelo
            const [resProv, resProd] = await Promise.all([
                api.get('/proveedores/'),
                productosAPI.getAll()
            ]);
            setProveedores(resProv.data);
            setProductos(resProd.data);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando listas de proveedores/productos");
        }
    };

    // --- MANEJO DEL CARRITO DE COMPRA ---
    const agregarItem = () => {
        if (!itemSeleccionado || !cantidad || !costoUnitario) {
            toast.error("Complete producto, cantidad y costo");
            return;
        }

        const productoObj = productos.find(p => p.id_prod === parseInt(itemSeleccionado));
        
        const nuevoItem = {
            producto_id: parseInt(itemSeleccionado),
            nombre: productoObj.nombre_prod,
            cantidad: parseInt(cantidad),
            precio_unitario: parseFloat(costoUnitario),
            subtotal: parseInt(cantidad) * parseFloat(costoUnitario)
        };

        setCarritoCompra([...carritoCompra, nuevoItem]);
        
        // Resetear campos de línea
        setItemSeleccionado('');
        setCantidad(1);
        setCostoUnitario('');
    };

    const eliminarItem = (index) => {
        const nuevoCarrito = carritoCompra.filter((_, i) => i !== index);
        setCarritoCompra(nuevoCarrito);
    };

    const totalCompra = carritoCompra.reduce((acc, item) => acc + item.subtotal, 0);

    // --- GUARDAR COMPRA ---
    const handleSubmit = async () => {
        if (!proveedorId) return toast.error("Seleccione un proveedor");
        if (carritoCompra.length === 0) return toast.error("Agregue al menos un producto");

        setLoading(true);
        try {
            // Estructura exacta que espera tu Serializer (CompraCreateSerializer)
            const payload = {
                proveedor: proveedorId,
                metodo_pago: metodoPago,
                detalles: carritoCompra.map(item => ({
                    producto: item.producto_id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                }))
            };

            await api.post('/compras/', payload);
            
            toast.success("Compra registrada. Stock actualizado.");
            navigate('/admin/dashboard/compras');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Error al registrar compra. ¿La caja está abierta?";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Entrada de Mercadería</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- COLUMNA IZQUIERDA: DATOS Y FORMULARIO --- */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Card Proveedor */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">1. Datos Generales</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor</label>
                                <select 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                    value={proveedorId}
                                    onChange={(e) => setProveedorId(e.target.value)}
                                >
                                    <option value="">Seleccionar...</option>
                                    {proveedores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Pago sale de:</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setMetodoPago('efectivo')}
                                        className={`flex-1 py-2 text-sm rounded-lg border ${metodoPago === 'efectivo' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        Efectivo (Caja)
                                    </button>
                                    <button 
                                        onClick={() => setMetodoPago('transferencia')}
                                        className={`flex-1 py-2 text-sm rounded-lg border ${metodoPago === 'transferencia' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                                    >
                                        Banco
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Agregar Producto */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">2. Agregar Productos</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500">Producto</label>
                                <select 
                                    className="w-full p-2 border rounded bg-white"
                                    value={itemSeleccionado}
                                    onChange={e => setItemSeleccionado(e.target.value)}
                                >
                                    <option value="">Seleccione producto...</option>
                                    {productos.map(prod => (
                                        <option key={prod.id_prod} value={prod.id_prod}>
                                            {prod.nombre_prod} (Actual: {prod.stock_act_prod})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-1/3">
                                    <label className="text-xs text-gray-500">Cant.</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border rounded"
                                        min="1"
                                        value={cantidad}
                                        onChange={e => setCantidad(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500">Costo Unit. ($)</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border rounded"
                                        placeholder="0.00"
                                        value={costoUnitario}
                                        onChange={e => setCostoUnitario(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={agregarItem}
                                className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-black transition-colors text-sm font-medium"
                            >
                                ＋ Agregar a la lista
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: RESUMEN --- */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Detalle de Factura</h3>
                            <span className="text-sm text-gray-500">{carritoCompra.length} items</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {carritoCompra.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p>Agregue productos para comenzar</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase border-b">
                                        <tr>
                                            <th className="py-2">Producto</th>
                                            <th className="py-2 text-center">Cant.</th>
                                            <th className="py-2 text-right">Costo U.</th>
                                            <th className="py-2 text-right">Subtotal</th>
                                            <th className="py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {carritoCompra.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-3 font-medium text-gray-700">{item.nombre}</td>
                                                <td className="py-3 text-center">{item.cantidad}</td>
                                                <td className="py-3 text-right text-gray-500">${item.precio_unitario}</td>
                                                <td className="py-3 text-right font-bold text-gray-800">${item.subtotal.toFixed(2)}</td>
                                                <td className="py-3 text-right">
                                                    <button 
                                                        onClick={() => eliminarItem(idx)}
                                                        className="text-red-400 hover:text-red-600 font-bold px-2"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-500">Total a Pagar</span>
                                <span className="text-3xl font-bold text-[#fb5b5b]">${totalCompra.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={handleSubmit}
                                disabled={loading || carritoCompra.length === 0}
                                className="w-full bg-[#fb5b5b] hover:bg-[#e04a4a] text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Compra y Actualizar Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrarCompra;