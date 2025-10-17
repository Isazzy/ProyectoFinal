import React, { useMemo, useState, useEffect } from "react";

/**
 * Productos – Control de Stock
 * -------------------------------------------------------
 * Características:
 * - Maquetado fiel a la captura: sidebar, header, filtros y lista.
 * - React puro + CSS puro (sin Tailwind). Todo en este archivo.
 * - Componentes desacoplados y listos para conectar a tu API Django.
 * - Accesible (roles/aria), responsive, y con variables CSS temáticas.
 * - Placeholders de handlers: onCreate, onEdit, onDelete, onAlarm.
 * - Filtros: búsqueda por texto, categoría, marca, estado.
 *
 * Sugerencia de integración:
 * - Reemplazá `useProductsMock` por llamadas reales a tu API (fetch/axios) en useEffect.
 * - Usá `onEdit`, `onDelete` y `onCreate` para abrir modales o navegar.
 */

export default function ProductosStockView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("activo");
  const { products, categories, brands, loading, error } = useProductsMock();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchText = !q ||
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q);
      const matchCategory = category === "todos" || p.category === category;
      const matchBrand = !brand || p.brand === brand;
      const matchStatus = status === "todos" || p.status === status;
      return matchText && matchCategory && matchBrand && matchStatus;
    });
  }, [products, query, category, brand, status]);

  // ---- Handlers de negocio para conectar a backend ----
  const onCreate = () => {
    console.log("CREATE: abrir modal o navegar a /productos/nuevo");
  };
  const onEdit = (id) => {
    console.log("EDIT: producto", id);
  };
  const onDelete = (id) => {
    console.log("DELETE: producto", id);
  };
  const onAlarm = () => {
    console.log("ALARM: alerta de local / stock crítico");
  };

  return (
    <div className="appRoot">
      <ThemeStyle />
      <Sidebar />
      <main className="content">
        <Header
          title="Productos"
          query={query}
          onQueryChange={setQuery}
          onCreate={onCreate}
        />

        <FiltersBar
          categories={["todos", ...categories]}
          brands={brands}
          statusOptions={["activo", "inactivo", "todos"]}
          category={category}
          setCategory={setCategory}
          brand={brand}
          setBrand={setBrand}
          status={status}
          setStatus={setStatus}
        />

        <section className="cardListWrapper" aria-live="polite">
          <div className="listHeaderActions">
            <button className="btn btn-warning" onClick={onAlarm}>
              <IconWarning /> Alarma de local
            </button>
            <button className="btn btn-ghost" onClick={onCreate}>
              <IconEdit /> Editar Producto
            </button>
          </div>

          {loading && <div className="empty">Cargando productos…</div>}
          {error && (
            <div className="empty error" role="alert">
              Ocurrió un error cargando productos.
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="empty">No hay productos que coincidan con el filtro.</div>
          )}

          <div className="tableLike" role="table" aria-label="Lista de productos">
            <div className="thead" role="rowgroup">
              <div className="tr" role="row">
                <div className="th" role="columnheader">Producto</div>
                <div className="th" role="columnheader">Tipo</div>
                <div className="th" role="columnheader">Precio</div>
                <div className="th" role="columnheader">Cantidad</div>
                <div className="th actions" role="columnheader" aria-label="Acciones"></div>
              </div>
            </div>
            <div className="tbody" role="rowgroup">
              {filtered.map((p) => (
                <div className="tr rowCard" role="row" key={p.id}>
                  <div className="td" role="cell">{p.name}</div>
                  <div className="td" role="cell">{p.type}</div>
                  <div className="td" role="cell">
                    {p.price.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="td" role="cell">{p.quantity}</div>
                  <div className="td actions" role="cell">
                    <IconButton label="Ver" onClick={() => console.log("VIEW", p.id)}>
                      <IconEye />
                    </IconButton>
                    <IconButton label="Editar" onClick={() => onEdit(p.id)}>
                      <IconEdit />
                    </IconButton>
                    <IconButton label="Eliminar" onClick={() => onDelete(p.id)}>
                      <IconTrash />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ========================
 * Sidebar
 * ======================== */
function Sidebar() {
  const items = [
    { id: "ventas", label: "Ventas", icon: <IconCash /> },
    { id: "clientes", label: "Clientes", icon: <IconUsers /> },
    { id: "productos", label: "Productos", icon: <IconBox />, active: true },
    { id: "reportes", label: "Reportes", icon: <IconChart /> },
    { id: "administracion", label: "Administración", icon: <IconShield /> },
    { id: "compras", label: "Compras", icon: <IconCart /> },
    { id: "proveedores", label: "Proveedores", icon: <IconTruck /> },
  ];

  return (
    <aside className="sidebar" aria-label="Menú lateral de administración">
      <div className="brand">
        <button className="hamburger" aria-label="Abrir menú">
          <IconMenu />
        </button>
        <div className="brandGreeting">
          <span className="hello">Hola</span>
          <strong>Romina</strong>
        </div>
        <button className="settings" aria-label="Configuración">
          <IconCog />
        </button>
      </div>

      <nav className="nav">
        <ul>
          {items.map((it) => (
            <li key={it.id}>
              <a
                href="#"
                className={"navItem" + (it.active ? " active" : "")}
                aria-current={it.active ? "page" : undefined}
              >
                <span className="navIcon">{it.icon}</span>
                <span className="navText">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

/* ========================
 * Header + Filtros
 * ======================== */
function Header({ title, query, onQueryChange, onCreate }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <div className="headerActions">
        <div className="search">
          <IconSearch />
          <input
            type="search"
            placeholder="Busca por nombre, marca…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>
        <button className="btn btn-primary" onClick={onCreate}>
          + Nuevo
        </button>
      </div>
    </header>
  );
}

function FiltersBar({
  categories,
  brands,
  statusOptions,
  category,
  setCategory,
  brand,
  setBrand,
  status,
  setStatus,
}) {
  return (
    <section className="filters">
      <div className="filterGroup">
        <label>Categoria</label>
        <Select value={category} onChange={setCategory}>
          {categories.map((c) => (
            <option value={c} key={c}>
              {capitalize(c)}
            </option>
          ))}
        </Select>
      </div>
      <div className="filterGroup">
        <label>Marca</label>
        <Select value={brand} onChange={setBrand} placeholder>
          <option value="">Selecciona una opción</option>
          {brands.map((b) => (
            <option value={b} key={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>
      <div className="filterGroup">
        <label>Estado del producto</label>
        <Select value={status} onChange={setStatus}>
          {statusOptions.map((s) => (
            <option value={s} key={s}>
              {capitalize(s)}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}

function Select({ value, onChange, children }) {
  return (
    <div className="selectWrap">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select"
      >
        {children}
      </select>
      <span className="selectIcon" aria-hidden>
        <IconChevronDown />
      </span>
    </div>
  );
}

/* ========================
 * Lista / tabla
 * ======================== */
function IconButton({ label, onClick, children }) {
  return (
    <button className="iconButton" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

/* ========================
 * Mock de datos – reemplazar por API Django
 * ======================== */
function useProductsMock() {
  const [state, setState] = useState({ loading: true, error: false, items: [] });

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({
        loading: false,
        error: false,
        items: [
          {
            id: 1,
            name: "Tintura",
            type: "Coloración",
            price: 15000,
            quantity: 7,
            category: "peluqueria",
            brand: "Koleston",
            status: "activo",
          },
          {
            id: 2,
            name: "Shampoo",
            type: "Cuidado capilar",
            price: 15000,
            quantity: 10,
            category: "peluqueria",
            brand: "Nivea",
            status: "activo",
          },
          {
            id: 3,
            name: "Fijador",
            type: "Cosmético",
            price: 5000,
            quantity: 5,
            category: "cosmetica",
            brand: "Maybelline",
            status: "activo",
          },
          {
            id: 4,
            name: "Esmalte rojo intenso",
            type: "Manicura",
            price: 1500,
            quantity: 8,
            category: "manicura",
            brand: "OPI",
            status: "inactivo",
          },
        ],
      });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(state.items.map((i) => i.category))),
    [state.items]
  );
  const brands = useMemo(
    () => Array.from(new Set(state.items.map((i) => i.brand).filter(Boolean))),
    [state.items]
  );

  return {
    products: state.items,
    categories,
    brands,
    loading: state.loading,
    error: state.error,
  };
}

/* ========================
 * Utilidades
 * ======================== */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ========================
 * Estilos (CSS puro)
 * ======================== */
function ThemeStyle() {
  return (
    <style>{`
:root {
  --bg: #000;
  --bg-contrast: #ecf5ef; /* panel central verdoso suave */
  --sidebar-bg: #f9cfcf;   /* rosado sidebar */
  --sidebar-accent: #f48f8f;/* hover/active en sidebar */
  --text: #222;
  --muted: #6b7280;
  --border: #e5e7eb;
  --card: #ffffff;
  --shadow: 0 2px 6px rgba(0,0,0,0.08);
  --primary: #ff8a8a;     /* botón +Nuevo */
  --primary-hover: #ff6f6f;
  --warning: #ffb020;     /* Alarma */
  --radius: 14px;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; color: var(--text); }

.appRoot { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; background: var(--bg); }

/* Sidebar */
.sidebar { background: linear-gradient(180deg, var(--sidebar-bg), #f6bcbc 50%, #f6d8d8); border-right: 1px solid #f4b9b9; padding: 14px 12px; position: sticky; top: 0; height: 100vh; }
.brand { display:flex; align-items:center; gap:8px; padding: 8px 6px; }
.hamburger, .settings { background: transparent; border: 0; cursor: pointer; padding: 6px; border-radius: 10px; }
.hamburger:hover, .settings:hover { background: rgba(255,255,255,0.6); }
.brandGreeting { display:flex; flex-direction: column; line-height: 1.1; margin-left: 4px; }
.brandGreeting .hello { color: var(--muted); font-size: 12px; }

.nav ul { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; }
.navItem { display:flex; align-items:center; gap: 10px; padding: 10px 12px; text-decoration: none; color: var(--text); border-radius: 10px; transition: background .2s, transform .03s; }
.navItem:hover { background: #ff5b5b; }
.navItem.active { background: #ff5b5b; border: 1px solid #f8bcbc; }
.navIcon { width: 18px; height: 18px; display:grid; place-items:center; }

/* Content */
.content { background: linear-gradient(180deg, #000, var(--bg-contrast) 25%); padding: 20px 26px; }
.header { display:flex; align-items:center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.header h1 { margin: 0; font-size: 26px; }
.headerActions { display:flex; align-items:center; gap: 10px; }
.search { display:flex; align-items:center; gap: 8px; background: var(--card); border: 1px solid var(--border); padding: 8px 10px; border-radius: 12px; min-width: 340px; box-shadow: var(--shadow); }
.search input { border: 0; outline: 0; width: 100%; font-size: 14px; background: transparent; }

.btn { border: 1px solid var(--border); padding: 10px 14px; border-radius: 12px; background: var(--card); cursor: pointer; box-shadow: var(--shadow); }
.btn-primary { background: var(--primary); color: #111; border-color: #ffb2b2; font-weight: 600; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-warning { background: #fff7ed; border-color: #fde68a; font-weight: 600; }
.btn-ghost { background: var(--card); }

/* Filtros */
.filters { display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 16px; background: var(--card); padding: 14px; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
.filterGroup { display:flex; flex-direction: column; gap: 6px; }
.filterGroup label { font-size: 12px; color: var(--muted); }
.selectWrap { position: relative; }
.select { appearance: none; width: 100%; padding: 12px 36px 12px 12px; border: 1px solid var(--border); border-radius: 10px; background: #ddd; }
.select:focus { outline: 2px solid #e5d1d1; }
.selectIcon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }

/* Tabla estilizada como tarjetas */
.cardListWrapper { margin-top: 18px; background: var(--bg-contrast); padding: 16px; border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); }
.listHeaderActions { display:flex; gap: 10px; justify-content: flex-end; margin-bottom: 10px; }
.tableLike { background: transparent; border-radius: var(--radius); }
.thead .tr { display:grid; grid-template-columns: 2fr 1.3fr 1fr 1fr 110px; gap: 10px; color: var(--muted); padding: 8px 10px; }
.th { font-weight: 600; font-size: 13px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.tbody { display:grid; gap: 12px; margin-top: 6px; }
.rowCard { background: var(--card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); padding: 14px 12px; display:grid; grid-template-columns: 2fr 1.3fr 1fr 1fr 110px; gap: 10px; align-items: center; }
.td { font-size: 14px; }
.td.actions, .th.actions { display:flex; justify-content: flex-end; gap: 8px; }
.iconButton { width: 36px; height: 36px; display:grid; place-items:center; border: 1px solid var(--border); background: #fff; border-radius: 10px; cursor: pointer; }
.iconButton:hover { background: #ff5b5b; }

.empty { text-align: center; color: var(--muted); padding: 24px; }
.empty.error { color: #b91c1c; }

/* Responsive */
@media (max-width: 1024px) {
  .appRoot { grid-template-columns: 220px 1fr; }
  .thead .tr, .rowCard { grid-template-columns: 1.5fr 1.1fr 1fr 0.8fr 90px; }
  .search { min-width: 260px; }
}
@media (max-width: 780px) {
  .appRoot { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; border-right: 0; border-bottom: 1px solid #f1c8c8; }
  .filters { grid-template-columns: 1fr; }
  .thead { display:none; }
  .rowCard { grid-template-columns: 1fr; gap: 6px; }
  .td.actions { justify-content: flex-start; }
}
    `}</style>
  );
}

/* ========================
 * Iconos (SVG inline, sin dependencias)
 * ======================== */
function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}
function IconCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 3.27 19.4l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 4.6 3.27l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 8 2.15V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0A1.65 1.65 0 0 0 14.82 3.6l.06-.06A2 2 0 0 1 20.73 4.6l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 21.85 8H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>
  );
}
function IconCash() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M16 7v10"/><circle cx="12" cy="12" r="2"/></svg>); }
function IconUsers() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>); }
function IconBox() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73"/><path d="M3.27 6.96L12 12l8.73-5.04"/></svg>); }
function IconChart() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>); }
function IconShield() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>); }
function IconCart() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>); }
function IconTruck() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 17h4V5H2v12h3"/><path d="M14 17h5l3-5h-5l-3 5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>); }
function IconChevronDown() { return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="6 9 12 15 18 9"/></svg>); }
