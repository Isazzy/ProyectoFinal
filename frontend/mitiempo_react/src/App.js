
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { getUsuario } from './api/Usuarios';
import Login from './componentes/Login/Login';
import UsForm from "./componentes/Usuarios/UsFrom"
import UsList from "./componentes/Usuarios/UsList"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/usuarios" element={<UsList />} />
        <Route path="/crear-usuario" element={<UsForm />} />
        <Route path="/editar-usuario/:id" element={<UsForm />} />
      </Routes>
    </Router>
  );
}

export default App;
