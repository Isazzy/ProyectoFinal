// front/src/componentesTurnos/TurnoLista.jsx
import React, { useEffect, useState } from "react";
import { getTurnos } from "../../api/turnos";
import TurnoCard from "./TurnoCard";
//Lista todos los turnos del cliente
export default function TurnoLista(){
    const[turnos, setTurnos] = useState([]);

    const cargarTurnos = () => {
        getTurnos().then(setTurnos);
    };
    useEffect(() => {
      getTurnos().then((data) => {
        setTurnos(data.filter(t => t.id_cli === user.id));
      });
    }, []);

    return (
    <div>
      <h3>Mis Turnos</h3>
      {turnos.length > 0 ? (
        turnos.map((t) => <TurnoCard key={t.id_turno} turno={t} />)
      ) : (
        <p>No tenés turnos todavía.</p>
      )}
    </div>
  );
}