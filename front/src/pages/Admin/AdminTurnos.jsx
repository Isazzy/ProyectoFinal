import React, { useEffect, useState } from "react";
import { turnosApi } from "../../api/turnosApi";
import { Button } from "../../components/ui";
import { useSwal } from "../../hooks/useSwal";

export default function AdminTurnos() {

  const [turnos, setTurnos] = useState([]);
  const { showSuccess, showError, confirm } = useSwal();

  const cargar = async () => {
    try {
      const data = await turnosApi.getTurnos();
      setTurnos(data);
    } catch (err) {
      console.error(err);
      showError("Error", "No se pudieron cargar los turnos");
    }
  };

  useEffect(() => { cargar(); }, []);

  const aceptarPago = async (turno) => {
    if (!(await confirm({ title: "¿Aceptar pago?", text: "Esto marcará el turno como pagado." }))) return;

    try {
      await turnosApi.aceptarPago(turno.id);
      await showSuccess("Listo", "Pago aceptado.");
      cargar();
    } catch (e) {
      showError("Error", "No se pudo aceptar el pago.");
    }
  };

  const rechazarPago = async (turno) => {
    if (!(await confirm({ title: "¿Rechazar pago?", text: "El cliente deberá volver a subir el comprobante." }))) return;

    try {
      await turnosApi.rechazarPago(turno.id);
      await showSuccess("Listo", "Pago rechazado.");
      cargar();
    } catch (e) {
      showError("Error", "No se pudo rechazar el pago.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Turnos</h2>

      {turnos.map(t => (
        <div key={t.id} className="card p-3 mb-3 shadow-sm">
          
          <p><b>Cliente:</b> {t.cliente}</p>
          <p><b>Fecha:</b> {new Date(t.fecha_hora_inicio).toLocaleString()}</p>
          <p><b>Estado turno:</b> {t.estado}</p>
          <p><b>Estado pago:</b> {t.estado_pago || "no_pagado"}</p>

          {t.comprobante_url && (
            <a 
              href={t.comprobante_url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: "block", marginTop: 10 }}
            >
              Ver comprobante
            </a>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
            {t.estado_pago === "seña" && (
              <>
                <Button 
                  variant="primary" 
                  onClick={() => aceptarPago(t)}
                >
                  Aceptar pago
                </Button>

                <Button 
                  variant="danger" 
                  onClick={() => rechazarPago(t)}
                >
                  Rechazar pago
                </Button>
              </>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
