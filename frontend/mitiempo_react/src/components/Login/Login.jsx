import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/Login.css";
import fondo from "../../imagenes/fondo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Correo o contraseña incorrecta");
        return;
      }

      // Guardar tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Intentar obtener rol
      let role = null;
      if (data.user && data.user.role) {
        role = data.user.role;
      } else if (data.access) {
        try {
          const [, payloadBase64] = data.access.split(".");
          const payload = JSON.parse(atob(payloadBase64));
          role = payload.role;
        } catch (err) {
          console.error("Error decodificando token", err);
        }
      }

      if (!role) throw new Error("No se pudo obtener el rol del usuario");
      localStorage.setItem("user", JSON.stringify({ role }));

      // Redirigir según rol
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "empleado") navigate("/panel_empleado");
      else navigate("/perfil_cliente");

    } catch (err) {
      console.error("Error al hacer login:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div
        className="login-left"
        style={{ backgroundImage: `url(${fondo})` }}
      >
        <h1>Romina Magallanez</h1>
        <p>ESTILISTA</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>

          <input
            type="text"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          {error && <p className="message error">{error}</p>}

          <div className="login-links">
            <button
              type="button"
              className="link-button"
              onClick={() => alert("Funcionalidad en desarrollo")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
