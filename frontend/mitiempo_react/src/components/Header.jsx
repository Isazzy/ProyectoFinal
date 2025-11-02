import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/header.css";

export default function Header() {
  const navigate = useNavigate();

  
  const token = localStorage.getItem("access");
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const handleTurnosClick = () => {
    if (token) {
      navigate("/turnos");
    } else {
      navigate("/login");
    }
  };

  const handlePerfilClick = () => {
    if (user?.rol === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/perfil_cliente");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/nosotros");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          Romina Magallanez
        </Link>

        {/* Navegación principal */}
        <nav className="nav-links">
          <Link to="/nosotros">Inicio</Link>
          <Link to="/servicios">Servicios</Link>
          <button onClick={handleTurnosClick} className="link-btn">
            Turnos
          </button>

          {/* Autenticación */}
          {!token ? (
            <div className="nav-links">
              <Link to="/login">Ingresar</Link>
              <Link to="/register">Registrarse</Link>
            </div>
          ) : (
            <div className="nav-links">
              <Link onClick={handlePerfilClick}>Mi perfil</Link>
              <Link onClick={handleLogout}>Cerrar sesión</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
