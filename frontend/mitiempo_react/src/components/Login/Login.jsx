import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Necesitas: npm install react-icons
import { useAuth } from "../../Context/AuthContext"; // Importa el hook de Auth
import api from "../../api/axiosConfig"; // Importa tu instancia de API
import "../../CSS/Login.css"; // Usa el CSS que te proporcioné
import fondo from "../../imagenes/fondo.png";
import ForgotPasswordModal from "./ForgotPasswordModal"; // Dependencia del modal

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Obtiene la función 'login' del contexto
  const { login } = useAuth();
  const navigate = useNavigate();

  // Efecto para "Recordar Usuario"
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedUser");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); // Previene el refresh del formulario
    setError("");

    // Validación de campos vacíos
    if (!email || !password) {
      setError("Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      
      // --- ¡CORRECCIÓN CRÍTICA! ---
      // Tu backend espera 'email' porque USERNAME_FIELD = 'email'
      const response = await api.post("/login/", {
        email: email, // <-- Envía 'email'
        password: password,
      });
      // -----------------------------
      
      const data = response.data;

      // Valida que el token exista en la respuesta
      if (!data.access) {
        console.error("Respuesta exitosa de la API, pero no se recibió 'access token'.");
        throw new Error("Error inesperado al iniciar sesión.");
      }

      // Llama a la función 'login' del AuthContext.
      // Esta función se encará de decodificar, guardar y redirigir.
      login(data.access, data.refresh);

      // Lógica de "Recordar Usuario"
      if (rememberMe) {
        localStorage.setItem("rememberedUser", email);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      
    } catch (err) {
      // Captura errores 401 (Credenciales incorrectas)
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
          <h1>Romina Magallanez</h1>
          <p>ESTILISTA</p>
        </div>

        <div className="login-right">
          <form className="login-card" onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>
            
            {/* Mensaje de error amigable */}
            {error && <p className="message error">{error}</p>}

            {/* Grupo de Email */}
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                />
                {/* Botón de Ver/Ocultar Contraseña */}
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
              
              {/* Link para abrir el modal */}
              <button
                type="button"
                className="link-button"
                onClick={() => setIsForgotModalOpen(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de Submit */}
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

      {/* Renderiza el Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
}