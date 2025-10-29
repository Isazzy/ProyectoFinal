import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import turnosApi from "../../api/turnos";
import { getServicios } from "../../api/servicios";
import api from "../../api/axiosConfig"; // Para la API de usuarios
import toast from "react-hot-toast";
// Usamos un CSS específico para este modal si lo deseas
import "../../CSS/TurnoFormAdmin.css"; 


const initialState = {
    id_cli: "",
    id_prof: "",
    fecha_turno: "",
    hora_turno: "", // Guardará HH:mm
    observaciones: "",
    id_servicios: [], // Array de IDs de servicios
};

// Recibe 'onClose' para cerrar el modal y 'turnoIdToEdit' si es para editar
export default function TurnoFormAdmin({ onClose, turnoIdToEdit = null }) {
    const [turnoData, setTurnoData] = useState(initialState);
    const [serviciosList, setServiciosList] = useState([]);
    const [profesionalesList, setProfesionalesList] = useState([]);
    const [clientesList, setClientesList] = useState([]);
    
    const [loading, setLoading] = useState(true); // Controla la carga inicial y el guardado
    const [error, setError] = useState(null);
    
    const navigate = useNavigate(); // Útil para redirigir si es necesario
    const isEditing = !!turnoIdToEdit; // Determina si estamos editando

    // --- Carga de datos para los Selects (Servicios, Profesionales, Clientes) ---
    useEffect(() => {
        const loadDropdownData = async () => {
            setLoading(true); // Inicia carga general
            try {
                const [servRes, profRes, cliRes] = await Promise.all([
                    getServicios(),
                    api.get("/usuarios/empleados/"), // Profesionales (empleados + admins)
                    // Asumiendo que tienes un endpoint o parámetro para listar solo clientes
                    // Ajusta esta URL si es necesario
                    api.get("/usuarios/?role=cliente") // Intenta filtrar clientes
                ]);
                
                setServiciosList(servRes.data.filter(s => s.activado));
                setProfesionalesList(profRes.data);
                
                // Si la API no filtró, filtramos aquí
                const clientes = cliRes.data.filter ? cliRes.data.filter(u => u.role === 'cliente') : cliRes.data;
                setClientesList(clientes);

            } catch (err) {
                console.error("Error cargando listas para el formulario:", err);
                setError("No se pudieron cargar los datos necesarios.");
                toast.error("Error al cargar datos para el formulario.");
            } finally {
                // Solo termina la carga si NO estamos editando (la carga de edición se maneja después)
                if (!isEditing) {
                    setLoading(false);
                }
            }
        };
        
        loadDropdownData();
    }, [isEditing]); // Depende de isEditing para saber cuándo terminar la carga inicial

    // --- Carga del Turno Específico (Solo en modo Edición) ---
    useEffect(() => {
        // Solo ejecutar si estamos editando y tenemos las listas cargadas
        if (isEditing && profesionalesList.length > 0 && clientesList.length > 0) {
            const loadTurno = async () => {
                try {
                    // Ya estábamos en loading=true desde el useEffect anterior
                    const res = await turnosApi.getTurnos(turnoIdToEdit);
                    const data = res.data;

                    // Formatear hora HH:mm:ss a HH:mm
                    const horaFormateada = data.hora_turno.substring(0, 5);

                    // Extraer IDs de servicios del array de objetos anidados
                    const idsServiciosActuales = data.servicios.map(s => s.servicio.id_serv);

                    setTurnoData({
                        // Asegurar que los IDs sean strings para los <select>
                        id_cli: String(data.id_cli), 
                        id_prof: String(data.id_prof),
                        fecha_turno: data.fecha_turno,
                        hora_turno: horaFormateada,
                        observaciones: data.observaciones || "",
                        id_servicios: idsServiciosActuales,
                    });

                } catch (err) {
                    console.error("Error cargando el turno para editar:", err);
                    setError("Error al cargar los datos del turno.");
                    toast.error("No se pudo cargar el turno para editar.");
                } finally {
                    setLoading(false); // Termina la carga aquí en modo edición
                }
            };
            loadTurno();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, turnoIdToEdit, profesionalesList, clientesList]); // Dependencias clave

    // --- Manejadores de Formulario ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTurnoData(prev => ({ ...prev, [name]: value }));
    };

    const handleServicioChange = (e) => {
        const { value, checked } = e.target;
        const servicioId = parseInt(value);

        setTurnoData(prev => {
            let currentServicios = [...prev.id_servicios];
            if (checked) {
                currentServicios.push(servicioId);
            } else {
                currentServicios = currentServicios.filter(id => id !== servicioId);
            }
            // Ordenar IDs numéricamente (opcional, buena práctica)
            currentServicios.sort((a, b) => a - b); 
            return { ...prev, id_servicios: currentServicios };
        });
    };

    // --- Guardar o Actualizar ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); 

        if (!turnoData.id_cli || !turnoData.id_prof || !turnoData.fecha_turno || !turnoData.hora_turno || turnoData.id_servicios.length === 0) {
            setError("Cliente, Profesional, Servicios, Fecha y Hora son obligatorios.");
            return;
        }

        setLoading(true);

        const payload = {
            id_cli: parseInt(turnoData.id_cli),
            id_prof: parseInt(turnoData.id_prof),
            fecha_turno: turnoData.fecha_turno,
            // Enviar hora como HH:mm (Django espera TimeField)
            hora_turno: turnoData.hora_turno, 
            id_servicios: turnoData.id_servicios,
            observaciones: turnoData.observaciones,
        };
        // Omitir estado_turno, el backend lo maneja

        try {
            if (isEditing) {
                await turnosApi.updateTurno(turnoIdToEdit, payload);
                toast.success("Turno actualizado correctamente");
            } else {
                await turnosApi.createTurno(payload);
                toast.success("Turno creado correctamente");
            }
            onClose(); // Cerrar modal al éxito

        } catch (err) {
            console.error("Error al guardar el turno:", err.response?.data || err);
            const apiError = err.response?.data;
            if (apiError) {
                // Intentar mostrar el error más específico del backend
                if (apiError.hora_turno) setError(`Error de horario: ${apiError.hora_turno[0]}`);
                else if (apiError.detail) setError(`Error: ${apiError.detail}`);
                else if (typeof apiError === 'object' && Object.keys(apiError).length > 0) {
                     // Si hay errores de campo (ej: id_prof inválido)
                     const firstErrorField = Object.keys(apiError)[0];
                     setError(`Error en ${firstErrorField}: ${apiError[firstErrorField][0]}`);
                }
                 else setError("Error de validación. Revisa los campos.");
            } else {
                setError("Error de red al guardar el turno.");
            }
            toast.error("Error al guardar el turno.");
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado del Modal ---
    return (
        <div className="modal-overlay" onClick={onClose}> 
            <div className="modal-content turno-modal-admin" onClick={(e) => e.stopPropagation()}>

                {/* Título del modal */}
                <h2 className="modal-title">{isEditing ? "Editar Turno" : "Agregar Nuevo Turno"}</h2>

                {/* Indicador de carga */}
                {loading && <p className="loading-text">Cargando...</p>}

                {/* Formulario (se muestra cuando NO está cargando) */}
                {!loading && (
                    <form onSubmit={handleSubmit} className="turno-form-admin">
                        
                        {/* Selector de Cliente */}
                        <div className="form-group">
                            <label htmlFor="id_cli">Cliente:</label>
                            <select id="id_cli" name="id_cli" value={turnoData.id_cli} onChange={handleChange} required>
                                <option value="" disabled>Seleccionar Cliente...</option>
                                {clientesList.map(cli => (
                                    <option key={cli.id} value={cli.id}>
                                        {cli.first_name || 'Sin Nombre'} {cli.last_name || ''} ({cli.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Profesional */}
                        <div className="form-group">
                            <label htmlFor="id_prof">Profesional:</label>
                            <select id="id_prof" name="id_prof" value={turnoData.id_prof} onChange={handleChange} required>
                                <option value="" disabled>Seleccionar Profesional...</option>
                                {profesionalesList.map(prof => (
                                    <option key={prof.id} value={prof.id}>
                                        {prof.first_name || 'Sin Nombre'} {prof.last_name || ''} ({prof.rol_profesional || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha y Hora */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fecha_turno">Fecha:</label>
                                <input id="fecha_turno" type="date" name="fecha_turno" value={turnoData.fecha_turno} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hora_turno">Hora (HH:mm):</label>
                                <input id="hora_turno" type="time" name="hora_turno" value={turnoData.hora_turno} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Selector de Servicios */}
                        <div className="form-group">
                            <label>Servicios:</label>
                            <div className="checkbox-group-admin">
                                {serviciosList.map(s => (
                                    <label key={s.id_serv} className="checkbox-label">
                                        <input 
                                            type="checkbox"
                                            value={s.id_serv}
                                            checked={turnoData.id_servicios.includes(s.id_serv)}
                                            onChange={handleServicioChange}
                                        />
                                        {s.nombre_serv} ({s.duracion_minutos} min)
                                    </label>
                                ))}
                                {serviciosList.length === 0 && <p>No hay servicios activos.</p>}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="form-group">
                            <label htmlFor="observaciones">Observaciones (Opcional):</label>
                            <textarea 
                                id="observaciones"
                                name="observaciones"
                                value={turnoData.observaciones}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Anotaciones internas sobre el turno..."
                            />
                        </div>

                        {/* Mensaje de Error */}
                        {error && <p className="form-error-admin">🚨 {error}</p>}

                        {/* Botones del Footer */}
                        <div className="modal-footer">
                             {isEditing && (
                                <button type="button" className="btn-delete-user" onClick={() => {/* Lógica eliminar */}} disabled={loading}>Eliminar</button>
                             )}
                            <div className="footer-actions">
                                <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-modal-save" disabled={loading}>
                                    {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear Turno")}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}