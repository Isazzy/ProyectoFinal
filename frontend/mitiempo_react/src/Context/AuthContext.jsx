// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  // 3. Verificar el token al cargar la app
  useEffect(() => {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      try {
        const decodedUser = jwtDecode(accessToken);
        if (decodedUser.exp * 1000 > Date.now()) {
          // Token es válido, establecemos el usuario
          setUser({
            id: decodedUser.user_id,
            role: decodedUser.role,
            username: decodedUser.username,
            email: decodedUser.email,
            first_name: decodedUser.first_name,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Token inválido o expirado:", error);
        localStorage.clear(); 
        setUser(null);
      }
    }
    setLoading(false);
  }, []); 

  // 4. Función de Login (con la redirección actualizada)
  const login = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    const decodedUser = jwtDecode(access);
    setUser({
      id: decodedUser.user_id,
      role: decodedUser.role,
      username: decodedUser.username,
      email: decodedUser.email,
      first_name: decodedUser.first_name,
    });

    // 💡 --- ¡LÓGICA DE REDIRECCIÓN ACTUALIZADA! ---
    if (decodedUser.role === "admin" || decodedUser.role === "empleado") {
      // Redirige a admin/empleado a su panel
      navigate("/admin/dashboard/");
    } else {
      // Redirige al cliente a "Nosotros"
      navigate("/nosotros"); 
    }
    // ---------------------------------------------
  };

  // 5. Función de Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login"); // Siempre redirige a login al salir
  };

  // 6. Valores que compartirá el contexto
  const value = {
    user,
    login,
    logout,
    loading,
  };

  if (loading) {
     return <div>Cargando...</div>; 
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 7. Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};