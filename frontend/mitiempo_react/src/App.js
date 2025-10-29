//App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Componentes base
import Header from "./components/Header";
import Login from "./components/Login/Login";
import Register from "./components/Registro/Register";

// Páginas públicas
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";

// Cliente
import TurnosFlow from "./components/Turnos/ReservaCliente";
import DashboardCliente from "./pages/Cliente/DashboardCliente";
import PerfilCliente from "./pages/Cliente/PerfilCliente";

// Admin
import AdminLayout from "./pages/Admin/AdminLayout"; // nuevo layout con Sidebar
import AdminServicios from "./pages/Admin/AdminServicios";
import AgendaAdmin from "./pages/Admin/AgendaAdmin";
import UsList from "./components/Usuarios/UsList";
import UsForm from "./components/Usuarios/UsFrom";
import ServiciosForm from "./components/Servicios/ServiciosForm";
import ProductoList from "./components/Productos/ProductoList";
import ProductoForm from "./components/Productos/ProductoForm";

// Rutas protegidas
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

// Librería Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

function Layout() {
  const location = useLocation();

  // Oculta el Header en las vistas donde no corresponde
  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  return (
    <>
      {!hideHeader && <Header />}
      <div style={{ marginTop: 0 }}>
        <Routes>
          {/* 🌐 RUTAS PÚBLICAS */}
          <Route path="/" element={<Nosotros />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 👤 RUTAS CLIENTE */}
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

          {/*  RUTAS ADMIN - con layout y Sidebar */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Subrutas dentro del panel admin */}
            <Route path="usuarios" element={<UsList />} />
            <Route path="usuarios/create" element={<UsForm />} />
            <Route path="usuarios/edit/:id" element={<UsForm />} />

            <Route path="servicios" element={<AdminServicios />} />
            <Route path="servicios/create" element={<ServiciosForm />} />
            <Route path="servicios/edit/:id" element={<ServiciosForm />} />

            <Route path="agenda" element={<AgendaAdmin />} />

            <Route path="productos" element={<ProductoList />} />
            <Route path="productos/create" element={<ProductoForm />} />
            <Route path="productos/edit/:id" element={<ProductoForm />} />
          </Route>
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
