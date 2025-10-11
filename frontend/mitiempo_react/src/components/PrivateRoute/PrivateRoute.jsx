// front/src/components/PrivateRoute/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, role }) {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (role && user.role !== role) {
    // rol no autorizado -> redirige a login o a su dashboard
    return <Navigate to="/Login" replace />;
  }

  return children;
}
