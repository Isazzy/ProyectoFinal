import React, { useState } from "react";
import Modal from "./Modal";
import toast from "react-hot-toast";

/**
 * Un modal genérico para crear una nueva entidad (ej. Marca, Categoría)
 * que solo requiere un campo de 'nombre'.
 * * @param {boolean} isOpen - Si el modal está abierto.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {string} title - Título del modal (ej. "Nueva Marca").
 * @param {string} label - Etiqueta del input (ej. "Nombre de la marca").
 * @param {function} onSubmit - Función async que se llama al guardar.
 * Recibe el objeto { nombre: "valor" }.
 * Debe retornar la entidad creada (o un ID).
 */
export default function QuickCreateModal({ isOpen, onClose, title, label, onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) {
      setError("El nombre es obligatorio.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Llama a la función (ej. createMarca) pasada como prop
      await onSubmit({ nombre });
      toast.success(`${title} creada con éxito.`);
      setNombre(""); // Resetea el input
      onClose(true); // Cierra el modal e indica que se guardó
    } catch (err) {
      setError("Error al guardar. ¿Quizás ya existe?");
      toast.error("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre("");
    setError("");
    onClose(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <button onClick={handleClose} className="btn btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="message error">{error}</p>}
        <div className="form-group">
          <label htmlFor="quick-create-nombre">{label}</label>
          <input
            id="quick-create-nombre"
            name="nombre"
            className="form-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoFocus
          />
        </div>
      </form>
    </Modal>
  );
}