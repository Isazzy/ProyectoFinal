//src/components/proveedores/ProveedorDetalle.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proveedorService, productoProveedorService } from '../../api/axiosConfig';

export default function ProveedorDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [prov, setProv] = useState(null);
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [relaciones, setRelaciones] = useState([]); // opcional: productos-proveedores
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, prods, compras] = await Promise.all([
          proveedorService.detalle(id),
          proveedorService.productos(id),
          proveedorService.historial(id),
        ]);
        setProv(p);
        setProductos(prods);
        setHistorial(compras);

        // opcional: relaciones por filtro productos_x_proveedores
        if (productoProveedorService?.listar) {
          try {
            const rels = await productoProveedorService.listar({ proveedor: id });
            setRelaciones(rels);
          } catch { /* ignorar si no aplica */ }
        }
      } catch (e) {
        console.error(e);
        setError('No se pudo cargar el detalle del proveedor');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const totalCompras = useMemo(
    () => (historial || []).reduce((acc, c) => acc + Number(c.total_compra || 0), 0),
    [historial]
  );

  if (loading) return <div className="p-3">Cargando...</div>;
  if (error) return (
    <div className="p-3">
      <p className="text-danger">{error}</p>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
  if (!prov) return (
    <div className="p-3">
      <p>No se encontró el proveedor.</p>
      <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard/proveedores')}>Volver</button>
    </div>
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Proveedor #{prov.id_prov} — {prov.nombre_prov}</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin/dashboard/proveedores')}
          >
            Volver
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/dashboard/proveedores/editar/${prov.id_prov}`)}
          >
            Editar
          </button>
        </div>
      </div>

      {/* Info general */}
      <div className="card p-3 mb-3">
        <h5 className="mb-3">Información</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <div><strong>Correo:</strong> {prov.correo || '-'}</div>
            <div><strong>Tipo:</strong> {prov.tipo_prov || '-'}</div>
          </div>
          <div className="col-md-4">
            <div>
              <strong>Activo:</strong>{' '}
              <span className={`badge ${prov.activo ? 'bg-success' : 'bg-secondary'}`}>
                {prov.activo ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos del proveedor */}
      <div className="card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5>Productos que vende</h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => alert('Podés crear una vista para vincular producto↔proveedor usando /productos-proveedores/')}
          >
            Vincular producto
          </button>
        </div>
        <div className="table-responsive mt-2">
          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Última compra</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr><td colSpan="4" className="text-center">Sin productos asociados</td></tr>
              ) : productos.map((pp, idx) => (
                <tr key={pp.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{pp?.id_prod?.nombre_prod || pp?.nombre_prod || '-'}</td>
                  <td>{pp?.precio_um ? `$${Number(pp.precio_um).toFixed(2)}` : '-'}</td>
                  <td>{pp?.d_compra ? new Date(pp.d_compra).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* (Opcional) Mostrar relaciones crudas del filtro productos_x_proveedores */}
        {relaciones?.length > 0 && (
          <>
            <h6 className="mt-3">Relaciones (productos-proveedores)</h6>
            <div className="small text-muted">Fuente: /api/productos-proveedores/?proveedor={id}</div>
            <ul className="mt-2">
              {relaciones.map((r, i) => (
                <li key={i}>
                  {r?.id_prod?.nombre_prod || `Producto ${r?.id_prod}`} — Prov #{r?.id_prov} — Precio: {r?.precio_um ?? '-'}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Historial de compras */}
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5>Historial de compras</h5>
          <div><strong>Total acumulado: </strong>${totalCompras.toFixed(2)}</div>
        </div>
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Productos</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr><td colSpan="5" className="text-center">Sin compras registradas</td></tr>
              ) : historial.map((c) => (
                <tr key={c.id_compra}>
                  <td>{c.id_compra}</td>
                  <td>{c.fecha_hs_comp ? new Date(c.fecha_hs_comp).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`badge badge-${(c.estado || '').toLowerCase()}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td>${Number(c.total_compra || 0).toFixed(2)}</td>
                  <td>{c.cantidad_productos ?? (c.detalles?.length ?? '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
