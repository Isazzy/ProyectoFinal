// src/components/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import { useAuth } from "../../Context/AuthContext"; 
import api from "../../api/axiosConfig"; 
// 💡 Importamos el CSS rediseñado
import "../../CSS/Login.css"; 
import fondo from "../../imagenes/fondo.png";
import ForgotPasswordModal from "./ForgotPasswordModal"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // --- Lógica (sin cambios, es correcta) ---
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedUser");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError("");

    if (!email || !password) {
      setError("Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login/", {
        email: email, 
        password: password,
      });
      
      const data = response.data;

      if (!data.access) {
        console.error("Respuesta exitosa de la API, pero no se recibió 'access token'.");
        throw new Error("Error inesperado al iniciar sesión.");
      }

      login(data.access, data.refresh);

      if (rememberMe) {
        localStorage.setItem("rememberedUser", email);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Correo o contraseña incorrectos";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div
          className="login-left"
          style={{ backgroundImage: `url(${fondo})` }}
        >
          {/* 🎨 Título con la fuente 'Great Vibes' */}
          <h1>Romina Magallanez</h1>
          <p>ESTILISTA</p>
        </div>

        <div className="login-right">
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>
            
            {/* 💡 1. Mensaje de error actualizado */}
            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            {/* Grupo de Email */}
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // 💡 2. Clase de formulario global
                className="form-input" 
                required
                autoFocus
              />
            </div>

            {/* Grupo de Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // 💡 2. Clase de formulario global
                  className="form-input" 
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Opciones (Recordar / Olvidé) */}
            <div className="form-options">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Recordar usuario</label>
              </div>
              
              <button
                type="button"
                className="link-button"
                onClick={() => setIsForgotModalOpen(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de Submit (usa .btn y .btn-primary global) */}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>

            <div className="login-links">
              <span>¿No tienes una cuenta?</span>
              <Link to="/register" className="link-button">
                Registrarse
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Renderiza el Modal (ya estilizado) */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
}