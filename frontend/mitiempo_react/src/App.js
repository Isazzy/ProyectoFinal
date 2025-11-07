import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "../src/App.css";

// 🔹 Contexto global de autenticación
import { AuthProvider } from "./Context/AuthContext";

// 🔹 Componentes base
import Header from "./components/Header";
import Login from "./components/Login/Login";
import Register from "./components/Registro/Register";

// 🔹 Páginas públicas
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";

// 🔹 Cliente
import BookingPage from "./components/Booking/BookingPage";
import ProfilePage from "./components/Booking/ProfilePage";

// 🔹 Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminServicios from "./pages/Admin/AdminServicios";
import AgendaAdmin from "./pages/Admin/AgendaAdmin";
import UsList from "./components/Usuarios/UsList";
import UsForm from "./components/Usuarios/UsFrom"; 
import ServiciosForm from "./components/Servicios/ServiciosForm";
import AdminProductos from "./pages/Admin/AdminProductos";
import ProductoForm from "./components/Productos/ProductoForm";
import StockHistoryPage from "./pages/Admin/StockHistoryPage";

// 🔹 Rutas protegidas
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

// 🔹 Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// ===================================================================
// Layout principal: Header visible solo en secciones públicas/cliente
// ===================================================================
function Layout() {
  const location = useLocation();

  // Ocultar el header en login, registro y rutas admin
  const hideHeader =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        {/* === PÚBLICAS === */}
        <Route path="/" element={<Nosotros />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* === CLIENTE === */}
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

        {/* === ADMIN / EMPLEADO === */}
        <Route
          path="/admin/dashboard/*"
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
        </Route>

        {/* === Fallback opcional === */}
        <Route path="*" element={<Nosotros />} />
      </Routes>
    </>
  );
}

// ===================================================================
// App principal: Router > AuthProvider > Layout
// ===================================================================
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}
