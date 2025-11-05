// src/components/Header/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/header.css";

export default function Header() {
  const navigate = useNavigate();

  // Recuperamos los datos guardados del usuario y token
  const token = localStorage.getItem("access");
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // Verificamos si pertenece a un grupo específico
  const userGroups = user?.groups || []; // Array esperado del backend
  const isAdmin = userGroups.includes("Administrador");
  const isEmpleado = userGroups.includes("Empleado");
  const isCliente = userGroups.includes("Cliente");

  // Navegación según estado del usuario
  const handleTurnosClick = () => {
    navigate(token ? "/turnos" : "/login");
  };

  const handlePerfilClick = () => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else if (isEmpleado) {
      navigate("/empleado/panel");
    } else {
      navigate("/perfil");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/nosotros");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo principal */}
        <Link to="/" className="logo">
          Romina Magallanez
        </Link>

        {/* Navegación */}
        <nav className="nav-links">
          <Link to="/nosotros">Inicio</Link>
          <Link to="/servicios">Servicios</Link>
          <button onClick={handleTurnosClick} className="link-btn">
            Turnos
          </button>

          {/* Acciones de sesión */}
          {!token ? (
            <>
              <Link to="/login" className="btn btn-secondary btn-small">
                Ingresar
              </Link>
              <Link to="/register" className="btn btn-primary btn-small">
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <button onClick={handlePerfilClick} className="link-btn">
                Mi perfil
              </button>
              <button onClick={handleLogout} className="link-btn link-danger">
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
