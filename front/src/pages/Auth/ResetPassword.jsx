import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export const ResetPassword = () => {
  const { uidb64, token } = useParams(); // Captura UID y Token de la URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isValidLink, setIsValidLink] = useState(true);

  // Validación básica al cargar
  useEffect(() => {
    if (!uidb64 || !token) {
      setIsValidLink(false);
      setMessage({
        type: 'error',
        text: 'El enlace es inválido. Solicita un nuevo enlace de recuperación.',
      });
    }
  }, [uidb64, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validaciones del frontend
    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/cliente/password-reset-confirm/${uidb64}/${token}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ new_password: password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '¡Tu contraseña ha sido restablecida exitosamente!',
        });
        setPassword('');
        setConfirmPassword('');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'El enlace es inválido o ha expirado.',
        });
        setIsValidLink(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión. Verifica tu red e intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidLink && !message.text) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Enlace Inválido</h2>
          <p>Este enlace no es válido o ha expirado.</p>
          <Link to="/forgot-password" className="btn-link">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Restablecer Contraseña</h2>
        <p className="auth-subtitle">
          Ingresa tu nueva contraseña a continuación.
        </p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {message.type === 'success' ? (
          <div className="success-message">
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={isSubmitting}
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                disabled={isSubmitting}
                minLength={8}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

