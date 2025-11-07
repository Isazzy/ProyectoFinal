// front/src/pages/Admin/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
// 💡 Asegúrate de importar el CSS corregido
import "../../CSS/adminLayout.css"; 

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      {/* 💡 Lógica de clase corregida: 
        Aplica 'collapsed' solo si sidebarOpen es 'false'.
        La clase 'expanded' no es necesaria.
      */}
      <main className={`admin-content ${!sidebarOpen ? "collapsed" : ""}`}>
        {/* Outlet renderizará las rutas anidadas de App.js 
            (AgendaAdmin, UsList, AdminServicios, etc.) */}
        <Outlet /> 
      </main>
      
    </div>
  );
}