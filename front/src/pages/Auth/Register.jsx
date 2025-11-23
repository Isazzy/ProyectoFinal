// ========================================
// src/pages/Auth/Register.jsx
// ========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input, Card } from '../../components/ui';
import styles from '../../styles/Auth.module.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useSwal();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
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
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.telefono && !/^\d{10,}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'Teléfono inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      await showSuccess(
        '¡Registro exitoso!',
      );
      navigate('/login');
    } catch (error) {
      showError('Error en registro', error.message || 'No se pudo completar el registro');
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
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.logo}>Mi Tiempo</h1>
            <p className={styles.subtitle}>Crea tu cuenta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                icon={User}
                error={errors.nombre}
                disabled={loading}
              />
              <Input
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                error={errors.apellido}
                disabled={loading}
              />
            </div>

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
              label="Teléfono (opcional)"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="1155554444"
              icon={Phone}
              error={errors.telefono}
              disabled={loading}
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              icon={Lock}
              error={errors.password}
              disabled={loading}
              autoComplete="new-password"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              icon={Lock}
              error={errors.confirmPassword}
              disabled={loading}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className={styles.submitButton}
            >
              Crear cuenta
            </Button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.registerText}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className={styles.link}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};