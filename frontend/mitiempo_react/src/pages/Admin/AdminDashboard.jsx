// front/src/pages/Admin/AdminDashboard.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import UsList from "../../components/Usuarios/UsList";
import UsForm from "../../components/Usuarios/UsFrom";
import ServiciosAdmin from "./AdminServicios";
import ServiciosForm from "../../components/Servicios/ServiciosForm";
import AgendaAdmin from "../Admin/AgendaAdmin";
import ProductoList from "../../components/Productos/ProductoList";
import ProductoForm from "../../components/Productos/ProductoForm";
import TurnoDetalleModal from "../../components/Turnos/TurnoDetalleModal";
import TurnoFormAdmin from "../../components/Turnos/TurnoFormAdmin";


export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`admin-content ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <Routes>
          <Route path="usuarios" element={<UsList />} />
          <Route path="usuarios/create" element={<UsForm />} />
          <Route path="usuarios/edit/:id" element={<UsForm />} />
          <Route path="servicios" element={<ServiciosAdmin sidebarOpen={sidebarOpen} />} />
          <Route path="servicios/create" element={<ServiciosForm />} />
          <Route path="servicios/edit/:id" element={<ServiciosForm />} />
          <Route path="/admin/dashboard/agenda" element={<AgendaAdmin />} />
          <Route path="/admin/dashboard/turnos/edit/:id" element={<TurnoDetalleModal/>} />
          <Route path="/admin/dashboard/reservar-turno" element={<TurnoFormAdmin/>} />
           <Route path="productos" element={<ProductoList />} />
          <Route path="productos/create" element={<ProductoForm />} />
          <Route path="productos/edit/:id" element={<ProductoList />} />

        </Routes>
      </div>
    </div>
  );
}