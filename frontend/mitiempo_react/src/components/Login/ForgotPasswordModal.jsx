// src/components/Login/ForgotPasswordModal.jsx
import React, { useState } from "react";
import Modal from "../Common/Modal"; // Importa el modal genérico
import api from "../../api/axiosConfig"; // Importa tu instancia de axios

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Para éxito o error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 💡 Asumimos un endpoint de backend.
    // El backend NUNCA debe decir "correo no encontrado".
    try {
      // await api.post("/usuarios/reset-password/", { email });

      // 💡 Mensaje genérico para evitar enumeración de usuarios
      setMessage(
        "Si tu correo está registrado, te enviaremos un enlace para recuperar tu contraseña."
      );
    } catch (err) {
      // Muestra el mismo mensaje incluso si falla
      setMessage(
        "Si tu correo está registrado, te enviaremos un enlace para recuperar tu contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Recuperar Contraseña"
    >
      <form onSubmit={handleSubmit}>
        {message ? (
          <p className="message success">{message}</p>
        ) : (
          <p>
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        )}

        <div className="form-group">
          <label htmlFor="reset-email">Correo electrónico</label>
          <input
            type="email"
            id="reset-email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || !!message} // Deshabilita si ya envió
          />
        </div>

        {!message && (
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>
          </div>
        )}
      </form>
      
      {/* CSS para el mensaje de éxito del modal */}
      <style>{`
        .message.success {
          background-color: var(--primary-color-light);
          color: var(--text-color);
          border: 1px solid var(--primary-color);
        }
      `}</style>
    </Modal>
  );
}