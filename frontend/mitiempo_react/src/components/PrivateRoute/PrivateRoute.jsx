// front/src/components/PrivateRoute/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, role }) {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    // Redirige a su propio dashboard según el rol
    if (user.role === "cliente") return <Navigate to="/perfil_cliente" replace />;
    if (user.role === "empleado") return <Navigate to="/empleado/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
