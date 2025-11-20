import React from "react";
import "./Modal.css"; // Importamos los estilos

/**
 * Componente Modal genérico y reutilizable.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función que se llama al cerrar (clic en fondo o botón X).
 * @param {string} props.title - El título que se mostrará en el header del modal.
 * @param {React.ReactNode} props.children - El contenido (cuerpo) del modal.
 * @param {React.ReactNode} [props.footer] - (Opcional) Contenido para el pie del modal, usualmente botones.
 */
export default function Modal({ isOpen, onClose, title, children, footer }) {
  // Si no está abierto, no renderiza nada.
  if (!isOpen) return null;

  return (
    // 1. El fondo difuminado (backdrop)
    // Llama a onClose si se hace clic fuera del contenido.
    <div className="modal-backdrop" onClick={onClose}>
      
      {/* 2. El contenedor del modal (contenido) */}
      {/* Detiene la propagación del clic para que no cierre el modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* 3. Encabezado del modal */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* 4. Cuerpo del modal (tu contenido) */}
        <div className="modal-body">
          {children}
        </div>

        {/* 5. Pie de página (opcional, para botones) */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}