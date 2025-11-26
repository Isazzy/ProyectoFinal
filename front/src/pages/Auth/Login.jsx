// ========================================
// src/pages/Auth/Login.jsx
// ========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input } from '../../components/ui';
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

  // Validación individual de campos
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) error = 'El email es requerido';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Ingresa un email válido';
    }
    if (name === 'password') {
      if (!value) error = 'La contraseña es requerida';
      else if (value.length < 6) error = 'Mínimo 6 caracteres';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todo antes de enviar
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const userData = await login(formData.email, formData.password);
      
      await showSuccess('¡Bienvenido!', `Hola ${userData.first_name || 'Usuario'}`);
      
      // Lógica de redirección por Rol
      const role = userData.role ? userData.role.toLowerCase() : '';
      if (role === 'administrador' || role === 'empleado') {
          navigate('/dashboard');
      } else {
          navigate('/');
      }

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Credenciales inválidas. Verifique sus datos.';
      showError('Error de Acceso', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* LADO IZQUIERDO: IMAGEN / BRANDING (Oculto en móvil) */}
      <div className={styles.brandSide}>
        <div className={styles.brandOverlay}>
          <div className={styles.brandContent}>
             <div className={styles.logoWrapper}>
                <Sparkles size={48} />
             </div>
             <h1>Mi Tiempo</h1>
             <p>Tu espacio de belleza y bienestar.</p>
          </div>
          <div className={styles.copyright}>
             © 2024 Mi Tiempo Estética
          </div>
        </div>
      </div>

      {/* LADO DERECHO: FORMULARIO */}
      <div className={styles.formSide}>
        <motion.div 
          className={styles.formWrapper}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <h2>¡Hola de nuevo!</h2>
            <p>Ingresa tus datos para acceder a tu cuenta.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ejemplo@correo.com"
              icon={Mail}
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />

            <div className={styles.passwordWrapper}>
                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password}
                  disabled={loading}
                  autoComplete="current-password"
                />
                #<div className={styles.forgotPassword}>
                    <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className={styles.submitButton}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿Aún no tienes cuenta?{' '}
              <Link to="/register" className={styles.link}>
                Regístrate gratis
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};