// src/pages/Home.jsx
import React from "react";
import ServiciosList from "../components/ServiciosList";

const Home = () => {
  return (
    <div>
      <h1>Bienvenido a MiTiempo</h1>
      <ServiciosList />
    </div>
  );
};

export default Home;