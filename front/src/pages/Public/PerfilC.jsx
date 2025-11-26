// ========================================
// src/pages/Cliente/PerfilC.jsx
// ========================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Edit2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi'; // Necesario para updateProfile
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input } from '../../components/ui';
import styles from '../../styles/PerfilC.module.css';

export const PerfilC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useSwal();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: '', // Este campo podría venir en user.cliente.telefono si el backend lo anida
    password: '', // Solo si quiere cambiarla
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
        setForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            telefono: user.telefono || '', // Ajustar según la estructura real de 'user'
            password: ''
        });
    }
  }, [user]);

  const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          // Preparamos payload (eliminamos password si está vacío)
          const payload = { ...form };
          if (!payload.password) delete payload.password;

          // Llamada a API (authApi.updateProfile debe existir y apuntar a PATCH /auth/profile/)
          const updatedUser = await authApi.updateProfile(payload);
          
          // Actualizar contexto
          updateUser(updatedUser);
          
          await showSuccess('Perfil Actualizado', 'Tus datos se han guardado correctamente.');
          setIsEditing(false);

      } catch (error) {
          console.error(error);
          showError('Error', 'No se pudieron guardar los cambios.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      <div className={styles.header}>
         <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/')}>Inicio</Button>
         <h1 className={styles.title}>Mi Perfil</h1>
      </div>

      <div className={styles.content}>
          <Card className={styles.profileCard}>
              <div className={styles.avatarSection}>
                  <div className={styles.avatar}>
                      {user?.first_name?.[0]?.toUpperCase() || <User size={40}/>}
                  </div>
                  <div className={styles.userInfo}>
                      <h2>{user?.first_name} {user?.last_name}</h2>
                      <p>{user?.email}</p>
                  </div>
                  {!isEditing && (
                      <button className={styles.editIconBtn} onClick={() => setIsEditing(true)} title="Editar">
                          <Edit2 size={20}/>
                      </button>
                  )}
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                      <Input 
                        label="Nombre" 
                        name="first_name" 
                        value={form.first_name} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        icon={User}
                        required
                      />
                      <Input 
                        label="Apellido" 
                        name="last_name" 
                        value={form.last_name} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        required
                      />
                  </div>

                  <Input 
                    label="Email" 
                    type="email"
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    disabled={!isEditing} // Email suele ser read-only o requiere re-auth
                    icon={Mail}
                  />

                  <Input 
                    label="Teléfono" 
                    type="tel"
                    name="telefono" 
                    value={form.telefono} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    icon={Phone}
                    placeholder="Tu número de contacto"
                  />

                  {isEditing && (
                      <div className={styles.securitySection}>
                          <h4 className={styles.secTitle}>Cambiar Contraseña (Opcional)</h4>
                          <Input 
                            label="Nueva Contraseña" 
                            type="password" 
                            name="password" 
                            value={form.password} 
                            onChange={handleChange} 
                            icon={Lock}
                            placeholder="Dejar vacío para mantener la actual"
                          />
                      </div>
                  )}

                  {isEditing && (
                      <div className={styles.actions}>
                          <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                          <Button type="submit" icon={Save} loading={loading}>Guardar Cambios</Button>
                      </div>
                  )}
              </form>
          </Card>
      </div>
    </motion.div>
  );
};