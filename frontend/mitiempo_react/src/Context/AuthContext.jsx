import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        console.log("🔹 Token decodificado:", decoded);

        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.user_id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role?.toLowerCase() || "cliente",
          });
        } else {
          localStorage.clear();
          setUser(null);
        }
      } catch (err) {
        console.error("Token inválido:", err);
        localStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    const decoded = jwtDecode(access);
    const role = decoded.role?.toLowerCase() || "cliente";
    setUser({
      id: decoded.user_id,
      username: decoded.username,
      email: decoded.email,
      role,
    });

    // ✅ Redirección correcta
    if (["administrador", "admin"].includes(role) || role === "empleado") {
      navigate("/admin/dashboard/");
    } else {
      navigate("/nosotros");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const value = { user, login, logout, loading };

  if (loading) return <div>Cargando...</div>;

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};
