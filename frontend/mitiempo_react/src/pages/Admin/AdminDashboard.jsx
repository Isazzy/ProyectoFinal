// front/src/pages/Admin/AdminDashboard.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import UsList from "../../components/Usuarios/UsList";
import UsForm from "../../components/Usuarios/UsFrom";
import ServiciosAdmin from "./AdminServicios";
import ServiciosForm from "../../components/Servicios/ServiciosForm";

export default function AdminDashboard() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          {/* CRUD Usuarios */}
          <Route path="usuarios" element={<UsList />} />
          <Route path="usuarios/create" element={<UsForm />} />
          <Route path="usuarios/edit/:id" element={<UsForm />} />

          {/* CRUD Servicios */}
          <Route path="servicios" element={<ServiciosAdmin />} />
          <Route path="servicios/create" element={<ServiciosForm />} />
          <Route path="servicios/edit/:id" element={<ServiciosForm />} />
        </Routes>
      </div>
    </div>
  );
}
