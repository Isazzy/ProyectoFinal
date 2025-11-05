// src/components/Header/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/header.css"; // Usaremos el nuevo CSS de abajo

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
      navigate("/perfil");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/nosotros"); // Redirige a inicio tras cerrar sesión
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo (Usará 'Great Vibes' desde CSS) */}
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

          {/* --- CORRECCIÓN DE JSX AQUÍ ---
              Quitamos los <div> anidados y usamos React.Fragment (<>) 
              para agrupar los links condicionales. 
          */}
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
              {/* Es mejor usar un <button> para acciones como logout */}
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