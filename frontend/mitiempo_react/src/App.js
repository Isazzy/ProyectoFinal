import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Componentes base
import Header from "./components/Header";
import Login from "./components/Login/Login";

// Páginas públicas
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";

// Cliente
import TurnosFlow from "./pages/Turnos/TurnosFlow";
import DashboardCliente from "./pages/Cliente/DashboardCliente";
import PerfilCliente from "./pages/Cliente/PerfilCliente";

// Admin
import DashboardAdmin from "./pages/Admin/AdminDashboard";
import AdminServicios from "./pages/Admin/AdminServicios";

// Rutas protegidas
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

// Libreria bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';


function Layout() {
  const location = useLocation();

  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login");

  return (
    <>
      {!hideHeader && <Header />} 
      <div style={{ marginTop: 0 }}>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Nosotros />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/login" element={<Login />} />

          {/*  RUTAS CLIENTE */}
          <Route
            path="/turnos"
            element={
              <PrivateRoute role="cliente">
                <TurnosFlow />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute role="cliente">
                <PerfilCliente />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil_cliente"
            element={
              <PrivateRoute role="cliente">
                <DashboardCliente />
              </PrivateRoute>
            }
          />

          {/*  RUTAS ADMIN */}
          <Route
            path="/admin/dashboard/*"
            element={
              <PrivateRoute role="admin">
                <DashboardAdmin />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
