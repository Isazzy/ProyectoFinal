// ========================================
// src/pages/Auth/Register.jsx
// ========================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input } from '../../components/ui';
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

  // --- LÓGICA DE VALIDACIÓN ---
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
        case 'nombre':
        case 'apellido':
            if (!value.trim()) error = "Este campo es requerido.";
            else if (value.length < 2) error = "Debe tener al menos 2 letras.";
            break;
        case 'email':
            if (!value) error = "Requerido.";
            else if (!/\S+@\S+\.\S+/.test(value)) error = "Formato de email inválido.";
            break;
        case 'telefono':
            // Acepta solo números, mínimo 8
            if (value && !/^\d{8,}$/.test(value.replace(/\D/g, ''))) {
                error = "Ingrese un número válido (mín. 8 dígitos).";
            }
            break;
        case 'password':
            if (!value) error = "Requerida.";
            else if (value.length < 8) error = "Mínimo 8 caracteres.";
            break;
        case 'confirmPassword':
            if (!value) error = "Requerida.";
            else if (value !== formData.password) error = "Las contraseñas no coinciden.";
            break;
        default:
            break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Validación especial en tiempo real para confirmación de password
    if (name === 'confirmPassword' && value !== formData.password) {
        // Opcional: Validar mientras escribe si quieres ser estricto
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todo el formulario
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
      const { confirmPassword, ...data } = formData;
      await register(data);
      
      await showSuccess('¡Cuenta Creada!', 'Ya puedes iniciar sesión con tus credenciales.');
      navigate('/login');
      
    } catch (error) {
      console.error(error);
      // Extraer mensaje del backend si existe
      const msg = error.response?.data?.detail || 
                  error.response?.data?.email?.[0] || 
                  'No se pudo completar el registro. Intente nuevamente.';
      showError('Error en registro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* IZQUIERDA: BRANDING */}
      <div className={styles.brandSide}>
        <div className={styles.brandOverlay}>
          <div className={styles.brandContent}>
             <div className={styles.logoWrapper}>
                <Sparkles size={48} />
             </div>
             <h1>Únete a Nosotros</h1>
             <p>Reserva tus turnos, gestiona tu perfil y disfruta de la mejor experiencia estética.</p>
          </div>
        </div>
      </div>

      {/* DERECHA: FORMULARIO */}
      <div className={styles.formSide}>
        <motion.div 
            className={styles.formWrapper}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <h2>Crear Cuenta</h2>
            <p>Completa tus datos para comenzar.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* GRUPO IDENTIDAD */}
            <div className={styles.formRow}>
                <Input
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Juan"
                    error={errors.nombre}
                    disabled={loading}
                    icon={User}
                />
                <Input
                    label="Apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Pérez"
                    error={errors.apellido}
                    disabled={loading}
                />
            </div>

            {/* GRUPO CONTACTO */}
            <div className={styles.formRow}>
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
                    icon={Mail}
                    error={errors.email}
                    disabled={loading}
                />
                <Input
                    label="Teléfono"
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="11 2345 6789"
                    icon={Phone}
                    error={errors.telefono}
                    disabled={loading}
                />
            </div>

            {/* GRUPO SEGURIDAD */}
            <div className={styles.formRow}>
                <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    icon={Lock}
                    error={errors.password}
                    disabled={loading}
                    placeholder="Mín. 8 caracteres"
                />
                <Input
                    label="Repetir Contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    icon={CheckCircle}
                    error={errors.confirmPassword}
                    disabled={loading}
                    placeholder="Confirma tu clave"
                />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className={styles.submitButton}
              icon={ArrowRight}
              iconPosition="right"
            >
              Registrarse
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className={styles.link}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};