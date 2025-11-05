// src/components/Registro/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig";
//  Importamos el CSS rediseñado
import "../../CSS/register.css"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Modal from "../Common/Modal"; // Para el mensaje de éxito

// --- Funciones de Validación (Sin cambios) ---
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Lógica de validación y submit (Sin cambios) ---
  const validateForm = () => {
    const { first_name, last_name, email, password, confirmPassword } = formData;
    
    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return false;
    }
    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return false;
    }
    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    
    setError(""); 
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("/usuarios/register/", {
        username: formData.email.split("@")[0], 
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role: "cliente", 
        // telefono: formData.telefono, 
      });

      setShowSuccessModal(true);
      
    } catch (err) {
      const errorMsg = err.response?.data?.email || err.response?.data?.username || "Error al registrar el usuario. Intenta con otro correo o nombre de usuario.";
      setError(errorMsg[0] || errorMsg); // Tomamos el primer error si es una lista
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/login"); 
  };
  // --------------------------------------------------

  return (
    <>
      <div className="register-container">
        <form className="register-box" onSubmit={handleSubmit}>
          <h2>Registrarse</h2>

          {/* 💡 1. Mensaje de Error actualizado a la clase global */}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* 💡 2. Se añade la clase global .form-input */}
            <div className="form-group">
              <input
                type="text"
                name="first_name"
                placeholder="Nombre"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input" 
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
                className="form-input"
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
                className="form-input"
                required
              />
            </div>
            <div className="form-group full-width">
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono "
                value={formData.telefono}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
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

      {/* --- Modal de Éxito (ya usa estilos globales) --- */}
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