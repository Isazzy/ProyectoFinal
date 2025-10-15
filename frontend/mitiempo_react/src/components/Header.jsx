import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/header.css";

export default function Header() {
  const navigate = useNavigate();

  // 🔹 Verificar si hay sesión activa
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
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          Romina Magallanez
        </Link>

        {/* Navegación visible para todos */}
        <nav className="nav-links">
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/servicios">Servicios</Link>
          <button onClick={handleTurnosClick} className="link-btn">
            Turnos
          </button>

          {/* Mostrar "Ingresar" o "Perfil" según sesión */}
          {!token ? (
            <Link to="/login" className="btn-login">
              Ingresar
            </Link>
          ) : (
            <>
              <button onClick={handlePerfilClick} className="btn-login">
                Perfil
              </button>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
