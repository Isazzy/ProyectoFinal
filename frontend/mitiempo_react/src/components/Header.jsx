// front/src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Header() {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = () => {

    navigate("/Login");
  };

  return (
    <nav className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">MiTiempo</Link>
        <div className="header-links">
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/servicios">Servicios</Link>
          <Link to="/turnos">Turnos</Link>
          {user ? (
            <>
              <Link to="/perfil">Perfil</Link>
              <button onClick={handleLogout} style={{ marginLeft: 10 }}>Logout</button>
            </>
          ) : (
            <Link to="/Login">Ingresar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
