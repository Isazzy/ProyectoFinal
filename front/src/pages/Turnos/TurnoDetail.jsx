// ========================================
// src/pages/Turnos/TurnoDetail.jsx
// ========================================
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle,
  X,
  Clock,
  User,
  FileText,
  ThumbsUp,
  Calendar,
  DollarSign,
  ReceiptText,
  Phone,
} from "lucide-react";

import { turnosApi } from "../../api/turnosApi";
import { useTurnos } from "../../hooks/useTurnos";
import { useSwal } from "../../hooks/useSwal";
import { Card, Button, Badge, Modal } from "../../components/ui";
import { formatDate, formatTime, formatCurrency } from "../../utils/formatters";

import styles from "../../styles/TurnoDetail.module.css";

export const TurnoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirmarTurno, completarTurno, cancelarTurno } = useTurnos();
  const { confirm, showSuccess, showError } = useSwal();

  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);

  // MODAL DE COMPROBANTE
  const [modalOpen, setModalOpen] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState(null);

  // ==============================
  // CARGAR TURNO
  // ==============================
  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const data = await turnosApi.getTurno(id);
        setTurno(data);
      } catch (error) {
        console.error("Error fetching turno:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, [id]);

  const totalEstimado = useMemo(() => {
    if (!turno?.servicios) return 0;
    return turno.servicios.reduce(
      (acc, s) => acc + parseFloat(s.precio),
      0
    );
  }, [turno]);

  if (loading)
    return <div className={styles.loading}>Cargando detalle...</div>;

  if (!turno)
    return <div className={styles.error}>Turno no encontrado</div>;

  console.log("COMPROBANTE URL DESDE EL BACK:", turno.comprobante_url); // ← PEGALO ACÁ

  const isPaid = turno.estado_pago === "pagado";

  const statusColors = {
    pendiente: "warning",
    confirmado: "primary",
    completado: "info",
    cancelado: "danger",
  };

  // ============================
  // HANDLERS
  // ============================

  const handleConfirm = async () => {
    if (
      await confirm({
        title: "Confirmar Asistencia",
        text: "¿El cliente ha confirmado que vendrá?",
      })
    ) {
      const success = await confirmarTurno(turno.id);
      if (success) {
        setTurno((prev) => ({ ...prev, estado: "confirmado" }));
      }
    }
  };

  const handleComplete = async () => {
    if (
      await confirm({
        title: "Finalizar Servicio",
        text: "¿Marcar el trabajo como terminado?",
      })
    ) {
      const success = await completarTurno(turno.id, turno.cliente);
      if (success) {
        setTurno((prev) => ({ ...prev, estado: "completado" }));
      }
    }
  };

  const handleCancel = async () => {
    if (
      await confirm({
        title: "Cancelar Turno",
        text: "Esta acción liberará el horario.",
        isDanger: true,
      })
    ) {
      const success = await cancelarTurno(turno.id);
      if (success) {
        setTurno((prev) => ({ ...prev, estado: "cancelado" }));
      }
    }
  };

  // ============================
  // ACEPTAR / RECHAZAR PAGO
  // ============================

  const handleAceptarPago = async () => {
    if (
      !(await confirm({
        title: "¿Aceptar pago?",
        text: "Se marcará el turno como PAGADO.",
      }))
    )
      return;

    try {
      await turnosApi.aceptarPago(turno.id);
      showSuccess("Pago aceptado", "El turno fue marcado como pagado.");

      const updated = await turnosApi.getTurno(id);
      setTurno(updated);
    } catch (e) {
      showError("Error", "No se pudo aceptar el pago.");
    }
  };

  const handleRechazarPago = async () => {
    if (
      !(await confirm({
        title: "¿Rechazar pago?",
        text: "El comprobante será eliminado.",
        isDanger: true,
      }))
    )
      return;

    try {
      await turnosApi.rechazarPago(turno.id);
      showSuccess("Comprobante eliminado", "El turno vuelve a NO PAGADO.");

      const updated = await turnosApi.getTurno(id);
      setTurno(updated);
    } catch (e) {
      showError("Error", "No se pudo rechazar el pago.");
    }
  };

  // ============================
  // ABRIR MODAL COMPROBANTE
  // ============================

  const openComprobanteModal = () => {
    if (!turno.comprobante_url) return;

    const base =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

    const finalURL = turno.comprobante_url.startsWith("http")
      ? turno.comprobante_url
      : base + turno.comprobante_url;

    setComprobanteUrl(finalURL);
    setModalOpen(true);
  };

  // ============================
  // RENDER
  // ============================

  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER */}
      <header className={styles.header}>
        <Button
          variant="ghost"
          icon={ChevronLeft}
          onClick={() => navigate("/turnos")}
        >
          Volver a Agenda
        </Button>

        <div className={styles.headerTitle}>
          <h1>Turno #{turno.id}</h1>
          <Badge variant={statusColors[turno.estado]} size="lg">
            {turno.estado.toUpperCase()}
          </Badge>
        </div>
      </header>

      <div className={styles.contentGrid}>
        {/* ================= IZQUIERDA ================= */}
        <div className={styles.leftColumn}>
          {/* CLIENTE */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <User size={20} /> Cliente
              </h2>
            </div>

            <div className={styles.clientInfo}>
              <div className={styles.clientAvatar}>
                {(turno.cliente || "C")[0].toUpperCase()}
              </div>

              <div className={styles.clientData}>
                <h3 className={styles.clientName}>
                  {turno.cliente || "Cliente Eventual"}
                </h3>

                {turno.cliente_telefono ? (
                  <span className={styles.clientPhone}>
                    <Phone size={14} /> {turno.cliente_telefono}
                  </span>
                ) : (
                  <span className={styles.noPhone}>
                    Sin teléfono registrado
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* SERVICIOS */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FileText size={20} /> Servicios Solicitados
              </h2>
            </div>

            <div className={styles.servicesList}>
              {(turno.servicios || []).map((s, i) => (
                <div key={i} className={styles.serviceItem}>
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>{s.nombre}</span>
                    <span className={styles.serviceDuration}>
                      <Clock size={12} /> {s.duracion_servicio} min
                    </span>
                  </div>

                  <span className={styles.servicePrice}>
                    {formatCurrency(s.precio)}
                  </span>
                </div>
              ))}

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span>Total Estimado</span>
                <span className={styles.totalPrice}>
                  {formatCurrency(totalEstimado)}
                </span>
              </div>
            </div>
          </Card>

          {turno.observaciones && (
            <Card className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Observaciones</h2>
              </div>
              <p className={styles.observacionesText}>
                {turno.observaciones}
              </p>
            </Card>
          )}
        </div>

        {/* ================= DERECHA ================= */}
        <div className={styles.rightColumn}>
          {/* FECHA / HORA */}
          <Card className={styles.contextCard}>
            <div className={styles.contextRow}>
              <Calendar className={styles.contextIcon} size={20} />
              <div>
                <span className={styles.contextLabel}>Fecha</span>
                <strong className={styles.contextValue}>
                  {formatDate(turno.fecha_hora_inicio)}
                </strong>
              </div>
            </div>

            <div className={styles.contextRow}>
              <Clock className={styles.contextIcon} size={20} />
              <div>
                <span className={styles.contextLabel}>Horario</span>
                <strong className={styles.contextValue}>
                  {formatTime(turno.fecha_hora_inicio)}{" "}
                  - {formatTime(turno.fecha_hora_fin)}
                </strong>
              </div>
            </div>

            <div className={styles.contextRow}>
              <CheckCircle className={styles.contextIcon} size={20} />
              <div>
                <span className={styles.contextLabel}>Estado Pago</span>
                <Badge variant={isPaid ? "success" : "secondary"}>
                  {isPaid ? "PAGADO" : "PENDIENTE"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* ACCIONES */}
          <Card className={styles.actionsCard}>
  <h3 className={styles.actionsTitle}>Acciones</h3>

  <div className={styles.actionsGrid}>

    {/* ========================
        ESTADO PENDIENTE
    ========================= */}
    {turno.estado === "pendiente" && (
      <>
        <Button
          icon={ThumbsUp}
          fullWidth
          onClick={handleConfirm}
        >
          Confirmar
        </Button>

        {/* ❌ Solo mostrar cancelar si NO está pagado */}
        {!isPaid && (
          <Button
            variant="danger"
            icon={X}
            fullWidth
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        )}
      </>
    )}

    {/* ========================
        ESTADO CONFIRMADO
    ========================= */}
    {turno.estado === "confirmado" && (
      <>
        <Button
          icon={CheckCircle}
          variant="success"
          fullWidth
          onClick={handleComplete}
        >
          Finalizar Trabajo
        </Button>

        {/* ❌ No mostrar cancelar si está pagado */}
        {!isPaid && (
          <Button
            variant="outline"
            icon={X}
            fullWidth
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        )}
      </>
    )}

    {/* ========================
        ESTADO COMPLETADO
    ========================= */}
    {turno.estado === "completado" && (
      isPaid ? (
        <Button
          icon={ReceiptText}
          variant="secondary"
          fullWidth
          onClick={openComprobanteModal}
        >
          Ver Comprobante
        </Button>
      ) : (
        <Button
          icon={DollarSign}
          fullWidth
          onClick={() =>
            navigate(`/ventas/nuevo?turno_id=${turno.id}`)
          }
        >
          Cobrar Turno
        </Button>
      )
    )}

    {/* ========================
        ESTADO CANCELADO
    ========================= */}
    {turno.estado === "cancelado" && (
      <p className={styles.cancelledText}>
        Este turno fue cancelado.
      </p>
    )}
  </div>

  {/* ======================================================
     🔥 SECCIÓN DE PAGO — OCULTAR SI YA ESTÁ PAGADO
  ======================================================= */}
  {turno.comprobante_url && !isPaid && (
    <>
      <Button
        variant="secondary"
        icon={ReceiptText}
        fullWidth
        onClick={openComprobanteModal}
      >
        Ver comprobante
      </Button>

      <Button
        variant="success"
        icon={CheckCircle}
        fullWidth
        onClick={handleAceptarPago}
      >
        Aceptar pago
      </Button>

      <Button
        variant="danger"
        icon={X}
        fullWidth
        onClick={handleRechazarPago}
      >
        Rechazar pago
      </Button>
    </>
  )}
</Card>

        </div>
      </div>

      {/* ============================
          MODAL COMPROBANTE
      ============================ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Comprobante del Pago"
        size="lg"
      >
        {comprobanteUrl &&
          (comprobanteUrl.toLowerCase().includes(".pdf") ? (
            <iframe
              src={comprobanteUrl}
              style={{
                width: "100%",
                height: "75vh",
                border: "none",
              }}
              title="Comprobante PDF"
            />
          ) : (
            <img
              src={comprobanteUrl}
              alt="Comprobante"
              style={{
                width: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
              }}
            />
          ))}
      </Modal>
    </motion.div>
  );
};
