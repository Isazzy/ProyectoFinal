import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login/Login"; 
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import TurnosFlow from "./pages/Turnos/TurnosFlow";
import DashboardCliente from "./pages/Cliente/DashboardCliente";
import Perfil from "./pages/Cliente/PerfilCliente";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import ServiciosAdmin from "./pages/Admin/ServiciosAdmin";

import ProductosStockView from "./components/Productos/Productos";


export default function App() {
  return (
      <div className="App">
          
      

        <Router>
          <Header />
          <div style={{ marginTop: 20 }}>
            <Routes>
              <Route path="/" element={<ProductosStockView />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/Login" element={<Login />} /> 
              <Route
                path="/turnos"
                element={
                  <PrivateRoute role="cliente">
                    <TurnosFlow />
                  </PrivateRoute>
                }
              />

              {/* Ruta protegida para Productos */}
            <Route path="/productos" element={
              <PrivateRoute>
                  <ProductosStockView /> {/* Aquí se renderiza tu componente después del login */}
              </PrivateRoute>
            } />
              <Route
                path="/perfil"
                element={
                  <PrivateRoute role="cliente">
                    <Perfil />
                  </PrivateRoute>
                }
              />
              <Route
                path="/perfil_cliente"
                element={
                  <PrivateRoute role="cliente">
                    <DashboardCliente />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/servicios"
                element={
                  <PrivateRoute role="admin">
                    <ServiciosAdmin />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
    
      </div>
  );
}
