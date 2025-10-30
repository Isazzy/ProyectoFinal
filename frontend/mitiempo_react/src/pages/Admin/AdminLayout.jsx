import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../CSS/adminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* 💡 Actualización: 
          Cambiamos <div> por <main> para mejor semántica HTML.
          <main> le indica al navegador que este es el contenido 
          principal de la página.
      */}
      <main className={`admin-content ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <Outlet /> {/* Aquí se cargan las páginas hijas */}
      </main>
      
    </div>
  );
}