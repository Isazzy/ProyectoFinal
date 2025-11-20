// src/App.js
import React from "react";
import {
  BrowserRouter as Router, // 💡 Renombrado a Router
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "../src/App.css";

// 💡 1. IMPORTAR EL PROVIDER
import { AuthProvider } from "./Context/AuthContext";

// Componentes base
import Header from "./components/Header";
import Login from "./components/Login/Login";
import Register from "./components/Registro/Register";

// Páginas públicas
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";

// Cliente
import BookingPage from "./components/Booking/BookingPage"; 
import DashboardCliente from "./pages/Cliente/DashboardCliente";
import PerfilCliente from "./pages/Cliente/PerfilCliente";

// Admin
import AdminLayout from "./pages/Admin/AdminLayout";
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


<<<<<<< HEAD
=======
// Layout sigue igual
>>>>>>> 874e3164 (reestructuracion de archivos)
function Layout() {
  const location = useLocation();

  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Nosotros />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* RUTAS CLIENTE */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute roles={["cliente"]}>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute roles={["cliente"]}>
              <PerfilCliente />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil_cliente"
          element={
            <PrivateRoute roles={["cliente"]}>
              <DashboardCliente />
            </PrivateRoute>
          }
        />

        {/* RUTAS ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={["admin", "empleado"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AgendaAdmin />} /> 
          <Route path="agenda" element={<AgendaAdmin />} />
          <Route path="usuarios" element={<UsList />} />
          <Route path="usuarios/create" element={<UsForm />} />
          <Route path="usuarios/edit/:id" element={<UsForm />} />
          <Route path="servicios" element={<AdminServicios />} />
          <Route path="servicios/create" element={<ServiciosForm />} />
          <Route path="servicios/edit/:id" element={<ServiciosForm />} />
          <Route path="productos" element={<ProductoList />} />
          <Route path="productos/create" element={<ProductoForm />} />
          <Route path="productos/edit/:id" element={<ProductoForm />} />
        </Route>
      </Routes>
    </>
  );
}

// 💡 2. CAMBIAR EL ORDEN AQUÍ
export default function App() {
  return (
    <Router> {/* <-- 1. Router DEBE estar por fuera */}
      <AuthProvider> {/* <-- 2. AuthProvider por dentro */}
        <Layout /> {/* <-- 3. Layout ahora tiene acceso a ambos contextos */}
      </AuthProvider>
    </Router>
  );
}