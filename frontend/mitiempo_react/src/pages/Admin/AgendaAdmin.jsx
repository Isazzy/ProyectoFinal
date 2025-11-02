import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import turnosApi from '../../api/turnos';
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; // Form modal
import TurnoDetalleModal from '../../components/Turnos/TurnoDetalleModal'; // Detail modal
import '../../CSS/AgendaAdmin.css'; // Main styles for the agenda page
import '../../CSS/TurnoDetalleModal.css'; // Specific styles for detail modal
import toast from 'react-hot-toast'; // For notifications

export default function AgendaAdmin({ sidebarOpen }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- State for Modals ---
    const [showFormModal, setShowFormModal] = useState(false); // Controls create/edit form
    const [showDetailModal, setShowDetailModal] = useState(false); // Controls detail view
    const [selectedTurnoId, setSelectedTurnoId] = useState(null); // ID for editing or details
    const [selectedTurnoDetails, setSelectedTurnoDetails] = useState(null); // Full data for detail modal

    // --- Fetch Turnos ---
    const fetchTurnos = async () => {
        setLoading(true);
        try {
            const res = await turnosApi.getTurnos();
            if (Array.isArray(res.data)) {
                // Map API data to FullCalendar event format
                const formattedEvents = res.data.map(turno => ({
                    id: String(turno.id_turno), // Ensure ID is string
                    title: turno.title || `${turno.cliente} - Servicio Desconocido`,
                    start: turno.start, // Expecting ISO string from serializer
                    end: turno.end,     // Expecting ISO string from serializer
                    backgroundColor: turno.backgroundColor || '#3788d8',
                    extendedProps: { // Store full turno data if needed later
                        ...turno
                    }
                }));
                setEvents(formattedEvents);
            } else {
                console.error("API did not return an array of turnos:", res.data);
                setEvents([]);
            }
        } catch (error) {
            console.error("Error loading turnos for agenda:", error);
            toast.error("Failed to load agenda.");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Load turnos on component mount
    useEffect(() => {
        fetchTurnos();
    }, []);

    // --- Modal Control ---
    const handleOpenCreateModal = () => {
        setSelectedTurnoId(null); // Ensure create mode
        setShowDetailModal(false); // Close detail if open
        setShowFormModal(true); // Open form modal
    };

    const handleOpenEditModal = (turnoId) => {
        setSelectedTurnoId(turnoId);
        setShowDetailModal(false); // Close detail modal
        setShowFormModal(true); // Open form modal for editing
    };

    const handleOpenDetailModal = async (turnoId) => {
        setSelectedTurnoId(turnoId);
        setShowFormModal(false); // Close form if open
        setShowDetailModal(true);
        setSelectedTurnoDetails(null); // Clear previous details

        // Fetch full details for the selected turno
        try {
            const res = await turnosApi.getTurnos(turnoId); // API call for single turno
            setSelectedTurnoDetails(res.data);
        } catch (error) {
            console.error("Error loading turno details:", error);
            toast.error("Could not load turno details.");
            setShowDetailModal(false); // Close modal on error
        }
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDetailModal(false);
        setSelectedTurnoId(null);
        setSelectedTurnoDetails(null);
        fetchTurnos(); // Refresh agenda data
    };

    // --- Delete Turno ---
    const handleCancelTurno = async (turnoId, eventTitle) => {
        if (window.confirm(`Are you sure you want to CANCEL (DELETE) the appointment for ${eventTitle}?`)) {
            try {
                await turnosApi.deleteTurno(turnoId);
                setEvents(prevEvents => prevEvents.filter(event => event.id !== turnoId.toString()));
                toast.success("Appointment cancelled successfully.");
                handleCloseModals(); // Close any open modal
            } catch (error) {
                console.error("Error cancelling appointment:", error);
                toast.error("Error cancelling appointment.");
            }
        }
     };

    // --- Calendar Event Click ---
    const handleEventClick = (clickInfo) => {
        const turnoId = clickInfo.event.id;
        // Open the detail modal first when an event is clicked
        handleOpenDetailModal(turnoId);
    };

    // --- Loading State ---
    const renderLoading = () => (
         <div className="agenda-loading">Loading agenda...</div>
    );

    // --- Main Render ---
    return (
        <div className={`p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} agenda-admin-container`}>

            {/* Header with Add Button */}
            <div className="agenda-header">
                <h2 className="text-xl font-bold">Appointment Schedule</h2>
                <button
                    className="btn-nueva-reserva"
                    onClick={handleOpenCreateModal} // Opens create form modal
                >
                    + Add Appointment
                </button>
            </div>

            {/* Calendar Wrapper */}
            <div className="agenda-wrapper dark-theme">
                {loading ? (
                    renderLoading()
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek'
                        }}
                        events={events}
                        eventClick={handleEventClick} // Opens detail modal
                        editable={false}
                        selectable={false}
                        allDaySlot={false}
                        slotMinTime="08:00:00"
                        slotMaxTime="21:00:00"
                        height="auto"
                        locale="es"
                        buttonText={{
                            today:    'Hoy',
                            month:    'Mes',
                            week:     'Semana'
                        }}
                        slotLabelFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            omitZeroMinute: false,
                            meridiem: 'short'
                        }}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false
                        }}
                    />
                )}
            </div>

            {/* Conditional Rendering: Create/Edit Form Modal */}
            {showFormModal && (
                <TurnoFormAdmin
                    onClose={handleCloseModals}
                    turnoIdToEdit={selectedTurnoId} // Pass ID for editing, null for create
                />
            )}

            {/* Conditional Rendering: Detail View Modal */}
            {showDetailModal && (
                <TurnoDetalleModal
                    turno={selectedTurnoDetails} // Pass the fetched details
                    onClose={handleCloseModals}
                    onEdit={handleOpenEditModal} // Function to switch to edit modal
                    onDelete={handleCancelTurno} // Function to delete
                />
            )}
        </div>
    );
}