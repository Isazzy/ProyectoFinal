// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input } from '../../components/ui';


import styles from '../../styles/Auth.module.css'; // Comparte estilos con Login

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8000/api/cliente/password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Te hemos enviado un correo con instrucciones para restablecer tu contraseña.',
        });
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Hubo un error. Intenta nuevamente.',
        });
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p className={styles.header}>
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
        </p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formSide}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

