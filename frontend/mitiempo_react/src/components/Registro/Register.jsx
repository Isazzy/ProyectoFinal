// src/components/Registro/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig";
import "../../CSS/register.css"; // CSS actualizado
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Modal from "../Common/Modal"; // Para el mensaje de éxito

// --- Funciones de Validación ---
const validateEmail = (email) => {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  // 8+ char, 1 Mayúscula, 1 minúscula, 1 número
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(password);
};
// ------------------------------

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 💡 Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Validación del Formulario ---
  const validateForm = () => {
    const { first_name, last_name, email, password, confirmPassword } = formData;
    
    // 1. Campos vacíos
    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return false;
    }
    // 2. Email válido
    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return false;
    }
    // 3. Contraseña segura
    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
      );
      return false;
    }
    // 4. Contraseñas coinciden
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    
    setError(""); // Limpia errores
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 💡 1. Valida antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("/usuarios/register/", {
        // Asigna 'username' si tu backend lo requiere, si no, quítalo
        username: formData.email.split("@")[0], 
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role: "cliente", // Fijo para el registro público
        // telefono: formData.telefono, // Asegúrate que tu backend acepta 'telefono'
      });

      // 💡 2. Muestra el modal de éxito
      setShowSuccessModal(true);
      
    } catch (err) {
      // 💡 3. Muestra errores del backend (ej: email ya existe)
      const errorMsg = err.response?.data?.email || err.response?.data?.username || "Error al registrar el usuario. Intenta con otro correo o nombre de usuario.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/login"); // Redirige al login DESPUÉS de cerrar el modal
  };

  return (
    <>
      <div className="register-container">
        <form className="register-box" onSubmit={handleSubmit}>
          <h2>Registrarse</h2>

          {/* 💡 Mensaje de Error Amigable */}
          {error && <p className="message error">{error}</p>}

          <div className="form-grid">
            {/* --- Inputs (Usando .form-group) --- */}
            <div className="form-group">
              <input
                type="text"
                name="first_name"
                placeholder="Nombre"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="last_name"
                placeholder="Apellido"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <input
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono (Opcional)"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            {/* --- Contraseñas --- */}
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <div className="register-footer">
            <span>¿Ya tienes una cuenta? </span>
            <Link to="/login" className="link-button">
              Iniciar sesión
            </Link>
          </div>
        </form>
      </div>

      {/* --- Modal de Éxito --- */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="¡Registro Exitoso!"
      >
        <p>Tu cuenta ha sido creada. Ahora serás redirigido para iniciar sesión.</p>
        <div className="form-actions">
          <button onClick={handleCloseSuccessModal} className="btn btn-primary">
            Aceptar
          </button>
        </div>
      </Modal>
    </>
  );
}