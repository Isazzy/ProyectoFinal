// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, // 👈 AGREGAR ESTE IMPORT
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
import ProfilePage from "./components/Booking/ProfilePage";

// Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminServicios from "./pages/Admin/AdminServicios";
import AgendaAdmin from "./pages/Admin/AgendaAdmin";
import UsList from "./components/Usuarios/UsList";
import UsForm from "./components/Usuarios/UsFrom";
import ServiciosForm from "./components/Servicios/ServiciosForm";
import AdminProductos from "./pages/Admin/AdminProductos";
import ProductoForm from "./components/Productos/ProductoForm";
import StockHistoryPage from "./pages/Admin/StockHistoryPage";
import ProveedorList from './components/proveedores/ProveedorList';
import ProveedorForm from './components/proveedores/ProveedorForm';
import ProveedorDetalle from './components/proveedores/ProveedorDetalle';

// 👈 CORREGIR IMPORTS DE COMPRAS (sin ../)
import CompraList from './components/compras/CompraList';
import CompraForm from './components/compras/CompraForm';

// Rutas protegidas
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

// Librería Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";


<<<<<<< HEAD
<<<<<<< HEAD
=======
// Layout sigue igual
>>>>>>> 874e3164 (reestructuracion de archivos)
=======
>>>>>>> 8868d1d9 (mando cambios front react)
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
              <ProfilePage />
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
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/create" element={<ProductoForm />} />
          <Route path="productos/edit/:id" element={<ProductoForm />} />
          <Route path="stock-history" element={<StockHistoryPage />} />
          
          {/* 👈 RUTAS DE COMPRAS (rutas relativas dentro de /admin/dashboard) */}
          <Route path="compras" element={<CompraList />} />
          <Route path="compras/nueva" element={<CompraForm />} />

          {/* Proveedores */}
          <Route path="proveedores" element={<ProveedorList />} />
          <Route path="proveedores/nuevo" element={<ProveedorForm />} />
          <Route path="proveedores/editar/:id" element={<ProveedorForm />} />
          <Route path="proveedores/detalle/:id" element={<ProveedorDetalle />} />

        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}