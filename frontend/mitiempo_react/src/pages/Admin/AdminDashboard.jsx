// front/src/pages/Admin/AdminDashboard.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import UsList from "../../components/Usuarios/UsList";
import UsForm from "../../components/Usuarios/UsFrom"; // Mantengo tu typo "UsFrom"
import ServiciosAdmin from "./AdminServicios";
import ServiciosForm from "../../components/Servicios/ServiciosForm";
import AgendaAdmin from "./AgendaAdmin"; // Corregido: Importación local
import ProductoList from "../../components/Productos/ProductoList";
import ProductoForm from "../../components/Productos/ProductoForm";
import TurnoFormAdmin from "../../components/Turnos/TurnoFormAdmin";
// 💡 TurnoDetalleModal no se importa aquí, es utilizado INTERNAMENTE por AgendaAdmin

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`admin-content ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <Routes>
          {/* Rutas de Usuarios */}
          <Route path="usuarios" element={<UsList />} />
         

          {/* Rutas de Servicios */}
          <Route path="servicios" element={<ServiciosAdmin sidebarOpen={sidebarOpen} />} />
          <Route path="servicios/create" element={<ServiciosForm />} />
          <Route path="servicios/edit/:id" element={<ServiciosForm />} />

          {/* Rutas de Agenda y Turnos (CORREGIDAS) */}
          <Route path="agenda" element={<AgendaAdmin />} />
          <Route path="turnos/create" element={<TurnoFormAdmin />} />
          <Route path="turnos/edit/:id" element={<TurnoFormAdmin />} />

          {/* Rutas de Productos (CORREGIDAS) */}
          <Route path="productos" element={<ProductoList />} />
          <Route path="productos/create" element={<ProductoForm />} />
          <Route path="productos/edit/:id" element={<ProductoForm />} /> {/* <-- CORREGIDO */}

        </Routes>
      </div>
    </div>
  );
}