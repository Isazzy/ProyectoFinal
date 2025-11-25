<<<<<<< HEAD
//src/components/PrivateRoute/PrivateRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// 💡 1. Importa el hook de tu contexto
import { useAuth } from '../../Context/AuthContext'; 

/**
 * Protege rutas basado en el estado de autenticación y rol.
 * @param {object} props
 * @param {Array<string>} props.roles - Array de roles permitidos (ej: ["admin", "empleado"])
 * @param {React.ReactNode} props.children - El componente a renderizar
 */
export default function PrivateRoute({ children, roles }) {
  // 💡 2. Obtiene el usuario y el estado de carga desde el contexto
  const { user, loading } = useAuth();
  const location = useLocation();

  // 3. Si está cargando el estado de auth, no renderizar nada
  if (loading) {
    // Puedes reemplazar esto con un componente <Spinner />
    return <div>Cargando...</div>; 
=======
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-screen">Cargando...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const userRole = user?.role?.toLowerCase?.() || "cliente";

  // 🔹 Normalizamos equivalencias
  const roleMap = {
    administrador: "admin",
    admin: "admin",
    empleado: "empleado",
    cliente: "cliente",
  };
  const normalizedRole = roleMap[userRole] || "cliente";

  if (roles && !roles.includes(normalizedRole)) {
    if (normalizedRole === "cliente") return <Navigate to="/perfil" replace />;
    if (["admin", "empleado"].includes(normalizedRole))
      return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/nosotros" replace />;
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  }

  // 4. Si no hay usuario, redirigir a Login
  if (!user) {
    // Guarda la página que intentaba visitar para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 5. Si la ruta requiere roles y el usuario no tiene el rol
  if (roles && !roles.includes(user.role)) {
    // Redirige a una página de "No Autorizado" o al home
    
    // Si es un cliente intentando entrar a /admin, redirige a su perfil
    if (user.role === 'cliente') {
      return <Navigate to="/perfil" replace />;
    }
    
    // Si es un admin/empleado intentando entrar a /perfil, redirige a su dashboard
    return <Navigate to="/admin/dashboard/agenda" replace />;
  }

  // 6. Si todo está bien, renderizar el componente hijo
  return children;
}