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
import { Login, Register } from '../pages/Auth';

// Main Pages
import { Dashboard } from '../pages/Dashboard/Dashboard';
import {TurnoDetail } from '../pages/Turnos/TurnoDetail';
import {CrearTurno } from '../pages/Turnos/CrearTurno';
import { TurnosList } from '../pages/Turnos/TurnosList';
import { ServiciosList } from '../pages/Servicios/ServiciosList';
import { ServicioDetail } from '../pages/Servicios/ServicioDetail';
import { VentasList } from '../pages/Ventas/VentasList';
import {CrearVenta } from '../pages/Ventas/CrearVenta';
import { ClientesList } from '../pages/Clientes/ClientesList';
import { EmpleadosList } from '../pages/Empleados/EmpleadosList';
//import { InventarioList } from '../pages/Inventario/InventarioList';
import { InventarioPage } from '../pages/Inventario/InventarioPage';
import { CajaPage } from '../pages/Caja/CajaPage';
import { VentaDetail } from '../pages/Ventas/VentaDetail';
import { ComprasPage } from '../pages/Compras/ComprasPage';
// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main Router
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

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

          {/* Clientes */}
          <Route path="/clientes" element={<ClientesList />} />
          <Route path='/compras' element={<ComprasPage/>}/>
        

          {/* Empleados (Admin only) */}
          <Route
            path="/caja"
            element={
              <ProtectedRoute adminOnly>
                <CajaPage />
              </ProtectedRoute>
            }

          />
          <Route
            path="/empleados"
            element={
              <ProtectedRoute adminOnly>
                <EmpleadosList />
              </ProtectedRoute>
            }
          />

          {/* Inventario */}
          <Route path="/inventario" element={<InventarioPage />} />
        </Route>

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;