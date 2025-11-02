import React, { useState, useEffect, useCallback } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getServicios } from "../../api/servicios";
import turnosApi from "../../api/turnos";
import api from "../../api/axiosConfig"; 
import { useNavigate } from "react-router-dom";
import TurnoResumen from "./TurnoResumen"; 
import "../../CSS/ReservaCliente.css";

// Función auxiliar para quitar tildes y normalizar a minúsculas
const normalizeString = (str) => {
    if (!str) return '';
    // Normaliza (NFD) y remueve caracteres diacríticos (tildes), luego a minúsculas
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Función auxiliar para obtener el nombre del día normalizado (Ej: "jueves" -> "jueves")
const getDayName = (date) => {
    // Usamos el locale 'es' para obtener el día y luego normalizamos
    return normalizeString(date.toLocaleDateString('es', { weekday: 'long' })); 
};

// Función auxiliar para formatear duración de minutos a H:MM
const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    
    if (h > 0) {
        return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${m} min`;
};

export default function ReservaCliente() {
    // 4 PASOS: 1:Servicios -> 2:Fecha -> 3:Horario -> 4:Resumen
    const [step, setStep] = useState(1); 
    const [servicios, setServicios] = useState([]);
    const [carrito, setCarrito] = useState([]); 
    
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date()); 
    const [fechaValidaSeleccionada, setFechaValidaSeleccionada] = useState(false); 
    
    const [disponibilidad, setDisponibilidad] = useState({}); 
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    const [slotConfirmado, setSlotConfirmado] = useState(null); 
    
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    
    const [profesionales, setProfesionales] = useState([]); 
    const [loadingInitialData, setLoadingInitialData] = useState(true); // 💡 ESTADO DE CARGA INICIAL

    // --- Función para verificar la disponibilidad del día (Pura) ---
    const checkDiaHabilitado = (date, view, profes) => {
        if (view !== 'month') return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        if (date < today) return false; 
        
        const dayName = getDayName(date);
        
        const algunProfesionalTrabaja = profes.some(prof => {
            // CRÍTICO: Normalizar la data del backend antes de comparar
            const diasTrabajo = (prof.dias_laborables || []).map(d => {
                const dayStr = typeof d === 'string' ? d : (d.dia || '');
                return normalizeString(dayStr);
            });
            return diasTrabajo.includes(dayName);
        });
        
        // Si no hay profesionales cargados (durante la carga inicial), bloqueamos todo
        if (profes.length === 0) return false; 
        
        return algunProfesionalTrabaja;
    }

    const isDiaHabilitado = useCallback(({ date, view }) => {
        return checkDiaHabilitado(date, view, profesionales);
    }, [profesionales]); 


    // --- Carga inicial ---
    useEffect(() => {
        const fetchData = async () => {
            setLoadingInitialData(true); // Iniciar carga
            try {
                const [servRes, profRes] = await Promise.all([
                    getServicios(),
                    api.get("/usuarios/empleados/") 
                ]);
                
                setServicios(servRes.data.filter(s => s.activado));
                const profData = profRes.data;
                setProfesionales(profData);
                
                const today = new Date();
                if (checkDiaHabilitado(today, 'month', profData)) {
                    setFechaValidaSeleccionada(true);
                }
                
            } catch (error) {
                console.error("Error cargando datos iniciales:", error);
            } finally {
                setLoadingInitialData(false); // Finalizar carga
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // --- Lógica de Carrito (Paso 1) ---
    const handleServicioToggle = (servicio) => {
        setDisponibilidad({});
        setSlotConfirmado(null);

        setCarrito(prev => {
            const isSelected = prev.find(s => s.id_serv === servicio.id_serv);
            if (isSelected) {
                return prev.filter(s => s.id_serv !== servicio.id_serv);
            } else {
                return [...prev, { ...servicio, id_prof: null, profName: null }]; 
            }
        });
    };

    // --- Lógica de Disponibilidad (Paso 3: Horarios) ---
    const buscarHorarios = async () => {
        if (carrito.length === 0 || !fechaValidaSeleccionada) return;

        const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
        
        setLoadingSlots(true);
        setDisponibilidad({});
        setSlotConfirmado(null);
        
        try {
            const idsServicios = carrito.map(s => s.id_serv);
            
            // NO ENVIAMOS id_prof, el BE filtra todos los aptos
            const res = await turnosApi.getHorariosDisponibles(
                null, 
                fechaFormateada,
                idsServicios
            );
            
            setDisponibilidad(res.data.disponibilidad);
            setStep(3); // Avanzar al Paso 3 (Mostrar Horarios)
            
        } catch (error) {
            console.error("Error al buscar horarios:", error.response?.data);
            alert("Error al buscar horarios: " + (error.response?.data?.error || "No se pudo buscar disponibilidad"));
        } finally {
            setLoadingSlots(false);
        }
    };
    
    // Captura el cambio de fecha y valida si el día es laborable (Paso 2)
    const handleDateChange = (date) => {
        setFechaSeleccionada(date);
        const esHabilitado = isDiaHabilitado({ date, view: 'month' });
        setFechaValidaSeleccionada(esHabilitado);
        
        if (esHabilitado) {
            setDisponibilidad({});
            setSlotConfirmado(null);
        }
    };

    // --- Lógica de Reserva (Paso 4: Resumen) ---
    const handleReservarSlot = (profesionalData, slot) => {
    console.log("Datos del profesional seleccionado:", profesionalData); // <-- Log para verificar ID
    setSlotConfirmado({ id_prof: profesionalData.id, hora: slot, nombre: profesionalData.nombre });
    setStep(4);
    };

    const handleConfirmarReserva = async () => {
        setSaving(true);
        try {
            const payload = {
                id_prof: slotConfirmado.id_prof, 
                id_servicios: carrito.map(s => s.id_serv), 
                fecha_turno: fechaSeleccionada.toISOString().split('T')[0], 
                hora_turno: slotConfirmado.hora, 
            };
    
            await turnosApi.createTurno(payload);
            alert("¡Turno reservado con éxito!");
            navigate("/"); 
        } catch (error) {
            console.error("Error al reservar:", error.response?.data);
            alert("Error al reservar: " + (error.response?.data?.hora_turno || error.response?.data?.detail || "Error"));
            setStep(3); 
        } finally {
            setSaving(false);
        }
    };

    // --- Cálculo de resumen (se mantiene) ---
    const serviciosPorTipo = servicios.reduce((grupos, serv) => {
        const tipo = serv.tipo_serv || "Sin categoría";
        if (!grupos[tipo]) grupos[tipo] = [];
        grupos[tipo].push(serv);
        return grupos;
    }, {});
    
    const resumenData = {
        servicioName: carrito.map(s => s.nombre_serv).join(', '),
        profName: slotConfirmado?.nombre || 'Pendiente', 
        fecha: fechaSeleccionada?.toLocaleDateString('es-AR'), 
        hora: slotConfirmado?.hora,
        precio: carrito.reduce((total, s) => total + parseFloat(s.precio_serv), 0),
        duracion: formatDuration(carrito.reduce((total, s) => total + s.duracion_minutos, 0)),
    };


    // ==================================================================
    // RENDERIZADO POR PASOS
    // ==================================================================

    // --- PASO 1: SELECCIONAR SERVICIOS ---
    const renderStep1 = () => (
        <div className="reserva-container">
            <h2 className="step-title">1. Seleccioná el Servicio</h2>
            
            {carrito.length > 0 && (
                <div className="carrito-resumen-flotante">
                    <h4>🛒 Tu Reserva (Total: {carrito.length})</h4>
                    <ul>
                        {carrito.map(s => (
                            <li key={s.id_serv}>
                                🟢 {s.nombre_serv} | ${s.precio_serv} | {formatDuration(s.duracion_minutos)}
                            </li>
                        ))}
                    </ul>
                    <p>Duración total estimada: **{resumenData.duracion}**</p>
                </div>
            )}

            {Object.entries(serviciosPorTipo).map(([tipo, listaServicios]) => (
                <div key={tipo} className="categoria-grupo">
                    <h3 className="categoria-titulo">{tipo}</h3>
                    <div className="servicios-lista">
                        {listaServicios.map((s) => {
                            const isSelected = carrito.find(sel => sel.id_serv === s.id_serv);
                            return (
                                <div key={s.id_serv} className={`servicio-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleServicioToggle(s)}
                                >
                                    <div className="servicio-info">
                                        <span className="servicio-nombre">{s.nombre_serv}</span>
                                        <span className="servicio-precio">${s.precio_serv}</span>
                                        <span className="servicio-duracion">| {formatDuration(s.duracion_minutos)}</span>
                                        {s.descripcion_serv && <p className="servicio-descripcion">{s.descripcion_serv}</p>}
                                    </div>
                                    <button 
                                        className={`btn-reservar-item ${isSelected ? 'btn-quitar' : 'btn-añadir'}`}
                                        onClick={(e) => { e.stopPropagation(); handleServicioToggle(s); }}
                                    >
                                        {isSelected ? "Quitar ➖" : "Añadir ➕"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            
            <div className="footer-accion">
                <button 
                    onClick={() => setStep(2)} 
                    disabled={carrito.length === 0}
                >
                    Siguiente (Elegir Fecha)
                </button>
            </div>
        </div>
    );
    
    // --- PASO 2: SELECCIONAR FECHA (Antes Paso 3) ---
    const renderStep2 = () => (
        <div className="reserva-container step-centered">
            <h2 className="step-title">2. Seleccioná la Fecha</h2>
            <div className="calendar-container">
                <Calendar
                    onChange={handleDateChange} 
                    value={fechaSeleccionada}
                    minDate={new Date()}
                    tileDisabled={isDiaHabilitado} 
                    tileClassName={({ date, view }) => !isDiaHabilitado({ date, view }) ? 'dia-deshabilitado' : null}
                    locale="es-AR"
                />
            </div>
            
            {!fechaValidaSeleccionada && (
                <p className="fecha-invalida-mensaje">
                    ⚠️ El **{fechaSeleccionada.toLocaleDateString('es-AR', { weekday: 'long' })}**, {fechaSeleccionada.toLocaleDateString('es-AR')}, no es un día laborable. Por favor, selecciona un día habilitado.
                </p>
            )}

            <div className="navigation-buttons">
                <button onClick={() => setStep(1)} className="btn-secondary">Volver</button>
                
                <button 
                    onClick={buscarHorarios}
                    disabled={!fechaValidaSeleccionada || loadingSlots}
                >
                    {loadingSlots ? "Buscando..." : "Siguiente (Horarios)"}
                </button>
            </div>
        </div>
    );

    // --- PASO 3: SELECCIONAR HORARIO (Antes Paso 4) ---
    const renderStep3 = () => (
        <div className="reserva-container">
            <h2 className="step-title">3. Seleccioná el Horario</h2>
            <p>Mostrando horarios para el día: **{fechaSeleccionada.toLocaleDateString('es-AR')}**</p>

            {loadingSlots && <p>Cargando disponibilidad...</p>}
            
            {Object.keys(disponibilidad).length === 0 && !loadingSlots && (
                <div className="sin-disponibilidad-mensaje">
                    <p>😔 No hay horarios disponibles que cubran **todos** tus servicios en secuencia para ningún profesional.</p>
                    <p>**Sugerencias:**</p>
                    <ul>
                        <li>Intenta buscar en una **fecha diferente**.</li>
                        <li>El tiempo total de servicio es de **{resumenData.duracion}**.</li>
                    </ul>
                </div>
            )}

            {/* Muestra los slots de CADA profesional apto */}
            {Object.entries(disponibilidad).map(([idProf, data]) => (
                <div key={idProf} className="profesional-slots">
                    <h4>{data.nombre} ({data.profesion || 'General'})</h4> 
                    <div className="slots-grid">
                        {data.slots.map(slot => (
                            <button 
                                key={slot} 
                                className="slot-btn"
                                onClick={() => handleReservarSlot(data, slot)} // data es el objeto profesional
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <div className="navigation-buttons">
                <button onClick={() => setStep(2)} className="btn-secondary">Volver a Fecha</button> 
            </div>
        </div>
    );

    // --- PASO 4: RESUMEN Y CONFIRMACIÓN (Antes Paso 5) ---
    const renderStep4 = () => {
        if (!TurnoResumen) return <p>Error: Componente TurnoResumen no encontrado.</p>;

        return (
            <div className="reserva-container step-centered">
                <h2 className="step-title">4. Confirmá la Solicitud</h2>
                <TurnoResumen
                    resumen={resumenData}
                    onBack={() => setStep(3)} 
                    onConfirm={handleConfirmarReserva}
                    saving={saving}
                />
            </div>
        );
    };

    //  mostrar carga
    const renderLoading = () => (
        <div className="reserva-container step-centered">
            <h2 className="step-title">Cargando datos...</h2>
            <p>Por favor, espere un momento.</p>
            {/*  añadir un spinner  aquí */}
        </div>
    );

    // --- Renderizado principal ---
    return (
        <div>
            {/* Stepper visual */}
            <div className="stepper-visual"> 
                <span className={step >= 1 ? 'active' : ''}></span>
                <span className={step >= 2 ? 'active' : ''}></span>
                <span className={step >= 3 ? 'active' : ''}></span>
                <span className={step >= 4 ? 'active' : ''}></span>
            </div>
            
            {step === 1 && renderStep1()}
            {/*  Mostrar carga O el Paso 2 */}
            {step === 2 && (loadingInitialData ? renderLoading() : renderStep2())} 
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
}