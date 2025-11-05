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
  }

  return children;
}
