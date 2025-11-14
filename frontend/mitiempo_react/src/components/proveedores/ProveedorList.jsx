// src/components/proveedores/ProveedorList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { proveedorService } from '../../api/axiosConfig';
import { 
  Search, 
  Plus, 
  Filter, 
  X, 
  Edit2, 
  Eye, 
  Trash2, 
  Package, 
  RefreshCw,
  ChevronDown,
  TrendingUp,
  Building2,
  Mail,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import './ProveedorList.css';

export default function ProveedorList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filtros, setFiltros] = useState({
    activo: '',
    search: '',
    tipo: '',
  });

  // helper para normalizar cualquier forma de respuesta de la API
  const normalizeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.results && Array.isArray(data.results)) return data.results;
    if (data.data && Array.isArray(data.data)) return data.data;
    const values = Object.values(data);
    for (const v of values) {
      if (Array.isArray(v)) return v;
    }
    return [];
  };

  const fetchData = useCallback(async (opts = filtros) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await proveedorService.listar(opts);
      console.log('RAW proveedores response:', raw);
      const lista = normalizeList(raw);
      console.log('Normalizada proveedores:', lista);
      setProveedores(lista);
    } catch (e) {
      console.error('Error cargando proveedores:', e, e?.response?.data || e?.message);
      setError('Error al cargar proveedores. Revisa console/network.');
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (location?.state?.refresh) {
      window.history.replaceState({}, document.title);
      fetchData();
    }
  }, [location?.state, fetchData]);

  const onChangeFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const onEliminar = async (id) => {
    if (!window.confirm('¿Eliminar proveedor?')) return;
    try {
      await proveedorService.eliminar(id);
      await fetchData();
    } catch (e) {
      console.error('Error eliminar proveedor:', e);
      alert('No se pudo eliminar. Ver logs.');
    }
  };

  const hasActiveFilters = filtros.activo || filtros.search || filtros.tipo;
  const activosCount = proveedores.filter(p => p.activo).length;
  const inactivosCount = proveedores.length - activosCount;

  if (loading) {
    return (
      <div className="proveedor-loading-container">
        <div className="proveedor-loading-content">
          <div className="proveedor-spinner-wrapper">
            <div className="proveedor-spinner"></div>
            <Package className="proveedor-spinner-icon" />
          </div>
          <p className="proveedor-loading-title">Cargando proveedores...</p>
          <p className="proveedor-loading-subtitle">Esto tomará solo un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proveedor-error-container">
        <div className="proveedor-error-card">
          <div className="proveedor-error-icon-wrapper">
            <X className="proveedor-error-icon" />
          </div>
          <h3 className="proveedor-error-title">¡Oops! Algo salió mal</h3>
          <p className="proveedor-error-message">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="proveedor-error-button"
          >
            <RefreshCw className="proveedor-button-icon" />
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="proveedor-list-page">
      
      {/* Header Hero Section */}
      <div className="proveedor-hero-header">
        <div className="proveedor-hero-container">
          <div className="proveedor-hero-content">
            
            {/* Left Side - Title & Stats */}
            <div className="proveedor-hero-left">
              <div className="proveedor-title-section">
                <div className="proveedor-icon-badge">
                  <Package className="proveedor-icon-large" />
                </div>
                <div>
                  <h1 className="proveedor-main-title">Proveedores</h1>
                  <p className="proveedor-subtitle">Gestiona tu red de suministro</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="proveedor-stats-grid">
                <div className="proveedor-stat-card">
                  <TrendingUp className="proveedor-stat-icon proveedor-stat-icon-green" />
                  <div>
                    <p className="proveedor-stat-number">{proveedores.length}</p>
                    <p className="proveedor-stat-label">Total</p>
                  </div>
                </div>
                <div className="proveedor-stat-card">
                  <CheckCircle2 className="proveedor-stat-icon proveedor-stat-icon-emerald" />
                  <div>
                    <p className="proveedor-stat-number">{activosCount}</p>
                    <p className="proveedor-stat-label">Activos</p>
                  </div>
                </div>
                <div className="proveedor-stat-card">
                  <XCircle className="proveedor-stat-icon proveedor-stat-icon-slate" />
                  <div>
                    <p className="proveedor-stat-number">{inactivosCount}</p>
                    <p className="proveedor-stat-label">Inactivos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="proveedor-hero-actions">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`proveedor-filter-button ${showFilters ? 'active' : ''}`}
              >
                <Filter className="proveedor-button-icon" />
                Filtros
                {hasActiveFilters && (
                  <span className="proveedor-filter-indicator"></span>
                )}
                <ChevronDown className={`proveedor-chevron ${showFilters ? 'rotate' : ''}`} />
              </button>
              
              <button
                onClick={() => navigate('/admin/dashboard/proveedores/nuevo')}
                className="proveedor-new-button"
              >
                <Plus className="proveedor-button-icon" />
                Nuevo Proveedor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="proveedor-main-container">
        
        {/* Filtros Expandibles */}
        {showFilters && (
          <div className="proveedor-filter-panel">
            <h3 className="proveedor-filter-title">
              <Filter className="proveedor-filter-title-icon" />
              Filtrar resultados
            </h3>
            <div className="proveedor-filter-grid">
              
              <div className="proveedor-form-group">
                <label className="proveedor-label">
                  Estado del Proveedor
                </label>
                <select 
                  name="activo" 
                  value={filtros.activo} 
                  onChange={onChangeFiltro}
                  className="proveedor-select"
                >
                  <option value="">📋 Todos los estados</option>
                  <option value="true">✅ Solo Activos</option>
                  <option value="false">❌ Solo Inactivos</option>
                </select>
              </div>

              <div className="proveedor-form-group">
                <label className="proveedor-label">
                  Tipo de Proveedor
                </label>
                <input
                  name="tipo"
                  value={filtros.tipo}
                  onChange={onChangeFiltro}
                  placeholder="Ej: Mayorista, Minorista..."
                  className="proveedor-input"
                />
              </div>

              <div className="proveedor-form-group">
                <label className="proveedor-label">
                  Búsqueda General
                </label>
                <div className="proveedor-search-wrapper">
                  <Search className="proveedor-search-icon" />
                  <input
                    name="search"
                    value={filtros.search}
                    onChange={onChangeFiltro}
                    placeholder="Buscar por nombre o correo..."
                    className="proveedor-input proveedor-input-search"
                  />
                </div>
              </div>
              
            </div>

            <div className="proveedor-filter-actions">
              <button 
                onClick={() => setFiltros({ activo:'',search:'',tipo:'' })}
                className="proveedor-clear-button"
              >
                <X className="proveedor-button-icon-small" />
                Limpiar filtros
              </button>
              <div className="proveedor-spacer"></div>
              <button 
                onClick={() => setShowFilters(false)}
                className="proveedor-apply-button"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {proveedores.length === 0 ? (
          <div className="proveedor-empty-state">
            <div className="proveedor-empty-icon">
              <Package className="proveedor-empty-package" />
            </div>
            <h3 className="proveedor-empty-title">No hay proveedores</h3>
            <p className="proveedor-empty-text">Comienza agregando tu primer proveedor al sistema</p>
            <button
              onClick={() => navigate('/admin/dashboard/proveedores/nuevo')}
              className="proveedor-empty-button"
            >
              <Plus className="proveedor-button-icon" />
              Crear Primer Proveedor
            </button>
          </div>
        ) : (
          <div className="proveedor-cards-grid">
            {proveedores.map(p => (
              <div 
                key={p.id_prov || p.id}
                className="proveedor-card"
              >
                {/* Card Header con degradado */}
                <div className={`proveedor-card-border ${p.activo ? 'active' : 'inactive'}`}></div>
                
                <div className="proveedor-card-content">
                  {/* Header del Card */}
                  <div className="proveedor-card-header">
                    <div className="proveedor-card-info">
                      <div className="proveedor-card-name-wrapper">
                        <Building2 className="proveedor-building-icon" />
                        <h3 className="proveedor-card-title">
                          {p.nombre_prov}
                        </h3>
                      </div>
                      <span className="proveedor-card-id">
                        #{p.id_prov ?? p.id}
                      </span>
                    </div>
                    
                    <div className={`proveedor-status-badge ${p.activo ? 'active' : 'inactive'}`}>
                      {p.activo ? <CheckCircle2 className="proveedor-status-icon" /> : <XCircle className="proveedor-status-icon" />}
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>

                  {/* Info del Card */}
                  <div className="proveedor-card-details">
                    <div className="proveedor-detail-row">
                      <Mail className="proveedor-detail-icon" />
                      <span className="proveedor-detail-text">{p.correo || 'Sin correo'}</span>
                    </div>
                    <div className="proveedor-detail-row">
                      <Package className="proveedor-detail-icon" />
                      <span className="proveedor-type-badge">
                        {p.tipo_prov || 'Sin tipo'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="proveedor-card-actions">
                    <button
                      onClick={() => navigate(`/admin/dashboard/proveedores/editar/${p.id_prov ?? p.id}`)}
                      className="proveedor-action-button proveedor-action-edit"
                      title="Editar"
                    >
                      <Edit2 className="proveedor-action-icon" />
                      Editar
                    </button>
                    <button
                      onClick={() => navigate(`/admin/dashboard/proveedores/detalle/${p.id_prov ?? p.id}`)}
                      className="proveedor-action-button proveedor-action-view"
                      title="Ver detalle"
                    >
                      <Eye className="proveedor-action-icon" />
                    </button>
                    <button
                      onClick={() => onEliminar(p.id_prov ?? p.id)}
                      className="proveedor-action-button proveedor-action-delete"
                      title="Eliminar"
                    >
                      <Trash2 className="proveedor-action-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}