// src/components/proveedores/ProveedorForm.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proveedorService } from '../../api/axiosConfig';

export default function ProveedorForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // editar si viene id
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre_prov: '',
    correo: '',
    tipo_prov: '',
    activo: true,
  });

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const data = await proveedorService.detalle(id);
        if (data) {
          setForm({
            nombre_prov: data.nombre_prov || '',
            correo: data.correo || '',
            tipo_prov: data.tipo_prov || '',
            activo: Boolean(data.activo),
          });
        }
      } catch (e) {
        console.error(e);
        alert('No se pudo cargar el proveedor');
        navigate('/admin/dashboard/proveedores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await proveedorService.actualizar(id, form);
        alert('Proveedor actualizado');
      } else {
        await proveedorService.crear(form);
        alert('Proveedor creado');
      }
      navigate('/admin/dashboard/proveedores', { state: { refresh: true }});
    } catch (e) {
      console.error(e);
      alert('No se pudo guardar. Revisá los campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <h2>{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>

      <form className="card p-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre *</label>
            <input
              name="nombre_prov"
              className="form-control"
              value={form.nombre_prov}
              onChange={onChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo</label>
            <input
              type="email"
              name="correo"
              className="form-control"
              value={form.correo}
              onChange={onChange}
              placeholder="proveedor@correo.com"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Tipo</label>
            <input
              name="tipo_prov"
              className="form-control"
              value={form.tipo_prov}
              onChange={onChange}
              placeholder="Mayorista / Minorista ..."
            />
          </div>

          <div className="col-md-3 d-flex align-items-center">
            <div className="form-check mt-4">
              <input
                id="activo"
                type="checkbox"
                className="form-check-input"
                name="activo"
                checked={form.activo}
                onChange={onChange}
              />
              <label className="form-check-label" htmlFor="activo">Activo</label>
            </div>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/dashboard/proveedores')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}
