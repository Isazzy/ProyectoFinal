import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ventasAPI } from '../../api/Ventas';
import { ProductosSelect, ServiciosSelect } from '../../components/Common/Selects';

export default function VentasMostrador({ onVentaCreada }) {
    const [detalles, setDetalles] = useState([{ producto: null, servicio: null, cantidad_venta: 1, precio_unitario: '' }]);

    const handleAgregarItem = () => {
        setDetalles([...detalles, { producto: null, servicio: null, cantidad_venta: 1, precio_unitario: '' }]);
    };

    const handleCambioItem = (index, campo, valor) => {
        const newDetalles = [...detalles];
        newDetalles[index][campo] = valor;
        setDetalles(newDetalles);
    };

    const handleSubmit = async () => {
        try {
            // Filtramos items sin producto ni servicio
            const filtered = detalles.filter(d => d.producto || d.servicio);
            if (!filtered.length) return toast.error("Agrega al menos un producto o servicio");

            const data = { detalles: filtered };
            const venta = await ventasAPI.crearVentaMostrador(data);
            toast.success(`Venta #${venta.id_venta} creada`);
            onVentaCreada(venta);
        } catch (err) {
            toast.error(err.response?.data?.error || "Error al crear venta");
        }
    };

    return (
        <div className="card p-4">
            <h3>Venta de mostrador</h3>
            {detalles.map((item, i) => (
                <div key={i} className="item-row">
                    <ProductosSelect
                        value={item.producto}
                        onChange={(v) => handleCambioItem(i, 'producto', v)}
                    />
                    <ServiciosSelect
                        value={item.servicio}
                        onChange={(v) => handleCambioItem(i, 'servicio', v)}
                    />
                    <input type="number" min="1" value={item.cantidad_venta} 
                        onChange={(e) => handleCambioItem(i, 'cantidad_venta', Number(e.target.value))} />
                    <input type="number" min="0" value={item.precio_unitario} 
                        onChange={(e) => handleCambioItem(i, 'precio_unitario', Number(e.target.value))} />
                </div>
            ))}
            <button onClick={handleAgregarItem}>Agregar producto/servicio</button>
            <button className="btn btn-primary mt-2" onClick={handleSubmit}>Generar Venta</button>
        </div>
    );
}
