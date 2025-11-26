// ========================================
// src/router/AppRouter.jsx
// ========================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

// Auth Pages
import { Login, Register, ForgotPassword, ResetPassword } from '../pages/Auth';


// Main Pages
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { TurnoDetail } from '../pages/Turnos/TurnoDetail';
import { CrearTurno } from '../pages/Turnos/CrearTurno';
import { TurnosList } from '../pages/Turnos/TurnosList';
import { ServiciosList } from '../pages/Servicios/ServiciosList';
import { ServicioDetail } from '../pages/Servicios/ServicioDetail';
import { VentasList } from '../pages/Ventas/VentasList';
import { CrearVenta } from '../pages/Ventas/CrearVenta';
import { ClientesList } from '../pages/Clientes/ClientesList';
import { EmpleadosList } from '../pages/Empleados/EmpleadosList';
import { InventarioPage } from '../pages/Inventario/InventarioPage';
import { CajaPage } from '../pages/Caja/CajaPage';
import { VentaDetail } from '../pages/Ventas/VentaDetail';
import { ComprasPage } from '../pages/Compras/ComprasPage';
import { LandingPage } from '../pages/Public/LandingPage';
import { BookingPage } from '../pages/Public/BookingPage';
import { CompraDetail } from '../pages/Compras/CompraDetail';
import { MisTurnos } from '../pages/Public/MisTurnos';
import { PerfilC } from '../pages/Public/PerfilC';

const LoadingScreen = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAF9F7' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #E8E6E3', borderTopColor: '#9B8DC5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
      <p style={{ color: '#7F8C9A', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  </div>
);

// Protected Route: Solo para Staff (Admin/Empleado)
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isEmpleado, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si es solo admin
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  
  // Si es un cliente intentando entrar al panel, lo mandamos a la web
  if (!isEmpleado && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

// Public Route: Redirige si ya estás logueado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isEmpleado, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated) {
    // Si ya está logueado, redirigir según rol
    if (isAdmin || isEmpleado) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* === WEB PÚBLICA (Clientes) === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/reservar" element={<BookingPage />} />
        {/* VISTA CLIENTE LOGUEADO */}
        <Route 
            path="/mis-turnos" 
            element={
               
                    
                    <MisTurnos />
               
            } 
        />
        <Route 
            path="/perfilC" 
            element={
                
                    <PerfilC />
                
            } 
        />

        {/* === AUTENTICACIÓN === */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:uidb64/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        </Route>

        {/* === PANEL DE GESTIÓN (Solo Staff) === */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          
          {/* Dashboard ahora en ruta explícita */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Turnos */}
          <Route path="/turnos" element={<TurnosList />} />
          <Route path="/turnos/nuevo" element={<CrearTurno />} />
          <Route path="/turnos/:id" element={<TurnoDetail />} />

          {/* Servicios */}
          <Route path="/servicios" element={<ServiciosList />} />
          <Route path="/servicios/:id" element={<ServicioDetail />} />

          {/* Ventas */}
          <Route path="/ventas" element={<VentasList />} />
          <Route path="/ventas/nuevo" element={<CrearVenta />} />
          <Route path="/ventas/:id" element={<VentaDetail />} />

          {/* Clientes y Compras */}
          <Route path="/clientes" element={<ClientesList />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/compras/:id" element={<CompraDetail />} />
          <Route path="/caja" element={<CajaPage />} />
          <Route path="/inventario" element={<InventarioPage />} />

          {/* Admin Only */}
          <Route path="/empleados" element={
            <ProtectedRoute adminOnly>
              <EmpleadosList />
            </ProtectedRoute>
          } />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;