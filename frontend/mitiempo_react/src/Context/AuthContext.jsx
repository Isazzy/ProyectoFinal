// src/Context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { authService } from "../api/axiosConfig"; // 👈 AGREGADO: importar servicio

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

  // 4. Función de Login (con llamada al backend)
  const login = async (username, password) => {
    try {
      // 👈 CAMBIO: Ahora llama al servicio de autenticación
      const response = await authService.login(username, password);
      
      // El servicio ya guarda los tokens en localStorage
      const decodedUser = jwtDecode(response.access);
      
      setUser({
        id: decodedUser.user_id,
        role: decodedUser.role || 'cliente', // Por si no viene role
        username: decodedUser.username || response.user.username,
        email: decodedUser.email || response.user.email,
        first_name: decodedUser.first_name || response.user.first_name,
      });

      // Lógica de redirección
      if (decodedUser.role === "admin" || decodedUser.role === "empleado") {
        navigate("/admin/dashboard/");
      } else {
        navigate("/nosotros");
      }

      return { success: true, data: response };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error al iniciar sesión",
      };
    }
  };

  // 4b. Función auxiliar para login directo con tokens (mantener compatibilidad)
  const loginWithTokens = (access, refresh) => {
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

    if (decodedUser.role === "admin" || decodedUser.role === "empleado") {
      navigate("/admin/dashboard/");
    } else {
      navigate("/nosotros");
    }
  };

  // 5. Función de Logout
  const logout = async () => {
    try {
      // 👈 CAMBIO: Llamar al servicio de logout
      await authService.logout();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      localStorage.clear();
      setUser(null);
      navigate("/login");
    }
  };

  // 6. Valores que compartirá el contexto
  const value = {
    user,
    login,
    loginWithTokens, // 👈 AGREGADO: Por compatibilidad con código existente
    logout,
    loading,
    isAuthenticated: !!user, // 👈 AGREGADO: Helper útil
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};