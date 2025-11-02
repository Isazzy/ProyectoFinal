import React from "react";
// Importa los estilos si los tienes en un archivo separado
// import "../../CSS/TurnoResumen.css"; 

// Asume que recibe: resumen = { servicioName, profName, fecha, hora, precio, duracion }
// y las funciones onBack, onConfirm, saving
export default function TurnoResumen({ resumen, onBack, onConfirm, saving }) {

    if (!resumen) {
        return <p>Error: No hay datos para mostrar el resumen.</p>;
    }

    return (
        <div className="turno-resumen-container"> {/* Usa una clase CSS para estilo */}
            <h3>Resumen de tu Turno</h3>
            
            <div className="resumen-detalle">
                <p>
                    <strong>Servicio(s):</strong> 
                    {/* Usa el campo 'servicioName' que es un string */}
                    {resumen.servicioName || "No especificado"} 
                </p>
                <p>
                    <strong>Fecha:</strong> 
                    {resumen.fecha || "No especificada"}
                </p>
                <p>
                    <strong>Hora:</strong> 
                    {resumen.hora || "No especificada"}
                </p>
                <p>
                    <strong>Duración Estimada:</strong> 
                    {resumen.duracion || "N/A"}
                </p>
                <p>
                    <strong>Precio Total Estimado:</strong> 
                    ${resumen.precio ? resumen.precio.toFixed(2) : '0.00'}
                </p>
            </div>

            {/* Botones de acción */}
            <div className="navigation-buttons resumen-buttons">
                <button 
                    onClick={onBack} 
                    disabled={saving} 
                    className="btn-secondary"
                >
                    Volver
                </button>
                <button 
                    onClick={onConfirm} 
                    disabled={saving}
                >
                    {saving ? "Confirmando..." : "Confirmar Turno"}
                </button>
            </div>
        </div>
    );
}

// Puedes añadir estilos básicos aquí o en un CSS
const styles = {
    // (Ejemplo si no usas CSS externo)
    turnoResumenContainer: {
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
        maxWidth: '400px',
        margin: 'auto',
        textAlign: 'left',
    },
    
};