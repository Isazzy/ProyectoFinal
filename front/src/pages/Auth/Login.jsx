// ========================================
// src/pages/Auth/Login.jsx
// ========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input, Card } from '../../components/ui';
import styles from '../../styles/Auth.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useSwal();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // El login devuelve los datos del usuario
      const userData = await login(formData.email, formData.password);
      await showSuccess('¡Bienvenido!', `Hola ${userData.first_name || 'Usuario'}`);
      
      // --- LÓGICA DE REDIRECCIÓN POR ROL ---
      const role = userData.role ? userData.role.toLowerCase() : '';
      
      if (role === 'administrador' || role === 'empleado') {
          // Si es Staff, va al Panel de Control
          navigate('/dashboard');
      } else {
          // Si es Cliente, va a la Landing Page (Home)
          navigate('/');
      }

    } catch (error) {
      showError('Error de acceso', error.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <motion.div
        className={styles.authCard}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={styles.cardInner}>
          <div className={styles.header}>
            <h1 className={styles.logo}>Mi Tiempo</h1>
            <p className={styles.subtitle}>Gestión de turnos y servicios</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              icon={Mail}
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=""
              icon={Lock}
              error={errors.password}
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className={styles.submitButton}
            >
              Ingresar
            </Button>
          </form>

          <div className={styles.footer}>
            <button type="button" className={styles.linkButton}>
              ¿Olvidaste tu contraseña?
            </button>
            <p className={styles.registerText}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className={styles.link}>
                Regístrate
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};