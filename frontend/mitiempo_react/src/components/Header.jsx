// src/components/Header/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/header.css"; // Usaremos el nuevo CSS de abajo

export default function Header() {
  const navigate = useNavigate();

<<<<<<< HEAD
=======
  // Recuperamos los datos guardados del usuario y token
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
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
    navigate("/nosotros"); // Redirige a inicio tras cerrar sesión
  };

  return (
    <header className="header">
      <div className="header-container">
<<<<<<< HEAD
        {/* Logo (Usará 'Great Vibes' desde CSS) */}
=======
        {/* Logo principal */}
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
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

<<<<<<< HEAD
          {/* --- CORRECCIÓN DE JSX AQUÍ ---
              Quitamos los <div> anidados y usamos React.Fragment (<>) 
              para agrupar los links condicionales. 
          */}
=======
          {/* Acciones de sesión */}
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
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
<<<<<<< HEAD
              {/* Es mejor usar un <button> para acciones como logout */}
=======
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
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