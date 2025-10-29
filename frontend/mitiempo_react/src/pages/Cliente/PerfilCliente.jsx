// front/src/pages/Cliente/PerfilCliente.jsx// front/src/pages/Cliente/Perfil.jsx
import React, { useEffect, useState } from "react";

export default function Perfil() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
   
  }, []);

  if (!user) return <div style={{ padding: 20 }}>No estás logueado.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Mi perfil</h1>
      <p><b>Rol:</b> {user.role}</p>
    
    </div>
  );
}
