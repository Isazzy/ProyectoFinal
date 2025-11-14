// src/components/Compras/CompraList.jsx
import React, { useState, useEffect } from 'react';
import { compraService } from '../../api/axiosConfig';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Filter, 
  X, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RefreshCw,
  Calendar,
  DollarSign,
  Package,
  User,
  TrendingUp,
  ChevronDown,
  Clock
} from 'lucide-react';
import './CompraList.css';

const CompraList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: '',
    proveedor: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  // Cargar compras
  useEffect(() => {
    fetchCompras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const fetchCompras = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await compraService.getAll(filtros);
      setCompras(response.results || response);
    } catch (err) {
      setError('Error al cargar compras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarCompra = async (id) => {
    if (!window.confirm('¿Completar esta compra?')) return;

    try {
      await compraService.completar(id);
      fetchCompras();
      alert('Compra completada exitosamente');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al completar compra');
    }
  };

  const handleCancelarCompra = async (id) => {
    if (!window.confirm('¿Cancelar esta compra?')) return;

    try {
      await compraService.cancelar(id);
      fetchCompras();
      alert('Compra cancelada exitosamente');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar compra');
    }
  };

  const handleEliminarCompra = async (id) => {
    if (!window.confirm('¿Eliminar esta compra? Esta acción no se puede deshacer.')) return;

    try {
      await compraService.delete(id);
      fetchCompras();
      alert('Compra eliminada exitosamente');
    } catch (err) {
      alert('Error al eliminar compra');
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      proveedor: '',
      fecha_desde: '',
      fecha_hasta: '',
    });
  };

  const hasActiveFilters = filtros.estado || filtros.proveedor || filtros.fecha_desde || filtros.fecha_hasta;
  const pendientesCount = compras.filter(c => c.estado === 'PENDIENTE').length;
  const completadasCount = compras.filter(c => c.estado === 'COMPLETADA').length;
  const totalCompletadas = compras
    .filter(c => c.estado === 'COMPLETADA')
    .reduce((sum, c) => sum + parseFloat(c.total_compra), 0);

  if (loading) {
    return (
      <div className="compra-loading-container">
        <div className="compra-loading-content">
          <div className="compra-spinner-wrapper">
            <div className="compra-spinner"></div>
            <ShoppingCart className="compra-spinner-icon" />
          </div>
          <p className="compra-loading-title">Cargando compras...</p>
          <p className="compra-loading-subtitle">Esto tomará solo un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compra-error-container">
        <div className="compra-error-card">
          <div className="compra-error-icon-wrapper">
            <X className="compra-error-icon" />
          </div>
          <h3 className="compra-error-title">¡Oops! Algo salió mal</h3>
          <p className="compra-error-message">{error}</p>
          <button 
            onClick={fetchCompras} 
            className="compra-error-button"
          >
            <RefreshCw className="compra-button-icon" />
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compra-list-page">
      
      {/* Header Hero Section */}
      <div className="compra-hero-header">
        <div className="compra-hero-container">
          <div className="compra-hero-content">
            
            {/* Left Side - Title & Stats */}
            <div className="compra-hero-left">
              <div className="compra-title-section">
                <div className="compra-icon-badge">
                  <ShoppingCart className="compra-icon-large" />
                </div>
                <div>
                  <h1 className="compra-main-title">Gestión de Compras</h1>
                  <p className="compra-subtitle">Administra tus órdenes de compra</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="compra-stats-grid">
                <div className="compra-stat-card">
                  <TrendingUp className="compra-stat-icon compra-stat-icon-blue" />
                  <div>
                    <p className="compra-stat-number">{compras.length}</p>
                    <p className="compra-stat-label">Total</p>
                  </div>
                </div>
                <div className="compra-stat-card">
                  <Clock className="compra-stat-icon compra-stat-icon-yellow" />
                  <div>
                    <p className="compra-stat-number">{pendientesCount}</p>
                    <p className="compra-stat-label">Pendientes</p>
                  </div>
                </div>
                <div className="compra-stat-card">
                  <CheckCircle className="compra-stat-icon compra-stat-icon-green" />
                  <div>
                    <p className="compra-stat-number">{completadasCount}</p>
                    <p className="compra-stat-label">Completadas</p>
                  </div>
                </div>
                <div className="compra-stat-card">
                  <DollarSign className="compra-stat-icon compra-stat-icon-emerald" />
                  <div>
                    <p className="compra-stat-number">${totalCompletadas.toFixed(2)}</p>
                    <p className="compra-stat-label">Total Invertido</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="compra-hero-actions">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`compra-filter-button ${showFilters ? 'active' : ''}`}
              >
                <Filter className="compra-button-icon" />
                Filtros
                {hasActiveFilters && (
                  <span className="compra-filter-indicator"></span>
                )}
                <ChevronDown className={`compra-chevron ${showFilters ? 'rotate' : ''}`} />
              </button>
              
              <button
                onClick={() => navigate('/admin/dashboard/compras/nueva')}
                className="compra-new-button"
              >
                <Plus className="compra-button-icon" />
                Nueva Compra
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="compra-main-container">
        
        {/* Filtros Expandibles */}
        {showFilters && (
          <div className="compra-filter-panel">
            <h3 className="compra-filter-title">
              <Filter className="compra-filter-title-icon" />
              Filtrar resultados
            </h3>
            <div className="compra-filter-grid">
              
              <div className="compra-form-group">
                <label className="compra-label">
                  Estado de Compra
                </label>
                <select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                  className="compra-select"
                >
                  <option value="">📋 Todos los estados</option>
                  <option value="PENDIENTE">⏳ Pendiente</option>
                  <option value="COMPLETADA">✅ Completada</option>
                  <option value="CANCELADA">❌ Cancelada</option>
                </select>
              </div>

              <div className="compra-form-group">
                <label className="compra-label">
                  Fecha desde
                </label>
                <input
                  type="date"
                  name="fecha_desde"
                  value={filtros.fecha_desde}
                  onChange={handleFiltroChange}
                  className="compra-input"
                />
              </div>

              <div className="compra-form-group">
                <label className="compra-label">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  name="fecha_hasta"
                  value={filtros.fecha_hasta}
                  onChange={handleFiltroChange}
                  className="compra-input"
                />
              </div>
              
            </div>

            <div className="compra-filter-actions">
              <button 
                onClick={limpiarFiltros}
                className="compra-clear-button"
              >
                <X className="compra-button-icon-small" />
                Limpiar filtros
              </button>
              <div className="compra-spacer"></div>
              <button 
                onClick={() => setShowFilters(false)}
                className="compra-apply-button"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {compras.length === 0 ? (
          <div className="compra-empty-state">
            <div className="compra-empty-icon">
              <ShoppingCart className="compra-empty-cart" />
            </div>
            <h3 className="compra-empty-title">No hay compras registradas</h3>
            <p className="compra-empty-text">Comienza creando tu primera orden de compra</p>
            <button
              onClick={() => navigate('/admin/dashboard/compras/nueva')}
              className="compra-empty-button"
            >
              <Plus className="compra-button-icon" />
              Crear Primera Compra
            </button>
          </div>
        ) : (
          <div className="compra-cards-grid">
            {compras.map((compra) => (
              <div 
                key={compra.id_compra}
                className="compra-card"
              >
                {/* Card Header con degradado según estado */}
                <div className={`compra-card-border ${compra.estado.toLowerCase()}`}></div>
                
                <div className="compra-card-content">
                  {/* Header del Card */}
                  <div className="compra-card-header">
                    <div className="compra-card-info">
                      <div className="compra-card-id-wrapper">
                        <ShoppingCart className="compra-cart-icon" />
                        <h3 className="compra-card-title">
                          Compra #{compra.id_compra}
                        </h3>
                      </div>
                    </div>
                    
                    <div className={`compra-status-badge ${compra.estado.toLowerCase()}`}>
                      {compra.estado === 'COMPLETADA' && <CheckCircle className="compra-status-icon" />}
                      {compra.estado === 'PENDIENTE' && <Clock className="compra-status-icon" />}
                      {compra.estado === 'CANCELADA' && <XCircle className="compra-status-icon" />}
                      {compra.estado}
                    </div>
                  </div>

                  {/* Info del Card */}
                  <div className="compra-card-details">
                    <div className="compra-detail-row">
                      <Calendar className="compra-detail-icon" />
                      <span className="compra-detail-text">
                        {new Date(compra.fecha_hs_comp).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="compra-detail-row">
                      <User className="compra-detail-icon" />
                      <span className="compra-detail-text">{compra.nombre_proveedor || 'N/A'}</span>
                    </div>
                    <div className="compra-detail-row">
                      <Package className="compra-detail-icon" />
                      <span className="compra-products-badge">
                        {compra.cantidad_productos || 0} productos
                      </span>
                    </div>
                    <div className="compra-detail-row">
                      <User className="compra-detail-icon" />
                      <span className="compra-detail-text-small">Por: {compra.nombre_usuario}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="compra-total-section">
                    <span className="compra-total-label">Total</span>
                    <span className="compra-total-amount">
                      ${parseFloat(compra.total_compra).toFixed(2)}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="compra-card-actions">
                    <button
                      onClick={() => navigate(`/admin/dashboard/compras/${compra.id_compra}`)}
                      className="compra-action-button compra-action-view"
                      title="Ver detalle"
                    >
                      <Eye className="compra-action-icon" />
                      Ver
                    </button>

                    {compra.estado === 'PENDIENTE' && (
                      <>
                        <button
                          onClick={() => handleCompletarCompra(compra.id_compra)}
                          className="compra-action-button compra-action-complete"
                          title="Completar"
                        >
                          <CheckCircle className="compra-action-icon" />
                          Completar
                        </button>
                        <button
                          onClick={() => handleCancelarCompra(compra.id_compra)}
                          className="compra-action-button compra-action-cancel"
                          title="Cancelar"
                        >
                          <XCircle className="compra-action-icon" />
                        </button>
                      </>
                    )}

                    {user?.is_staff && (
                      <button
                        onClick={() => handleEliminarCompra(compra.id_compra)}
                        className="compra-action-button compra-action-delete"
                        title="Eliminar"
                      >
                        <Trash2 className="compra-action-icon" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompraList;