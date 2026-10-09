import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, cerrarSesion, obtenerUsuario } from "./api";
import Estadisticas from "./Estadisticas";

const ESTADOS = [
  { valor: "abierto", texto: "Abierto" },
  { valor: "en_proceso", texto: "En proceso" },
  { valor: "resuelto", texto: "Resuelto" },
];

const CATEGORIAS = ["red", "hardware", "software", "cuentas", "otros"];

function textoEstado(valor) {
  return ESTADOS.find((e) => e.valor === valor)?.texto || valor;
}

export default function Tickets() {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const esTecnico = usuario?.role === "tecnico";

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  async function cargar() {
    try {
      const datos = await api("/tickets");
      setTickets(datos.tickets);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/tickets", { method: "POST", body: { title, description } });
      setTitle("");
      setDescription("");
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cambiarEstado(id, status) {
    setError("");
    try {
      await api(`/tickets/${id}/estado`, { method: "PATCH", body: { status } });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  function salir() {
    cerrarSesion();
    navigate("/login");
  }

  const texto = busqueda.trim().toLowerCase();
  const visibles = tickets.filter((t) => {
    if (filtroEstado !== "todos" && t.status !== filtroEstado) return false;
    if (filtroCategoria !== "todas" && t.category !== filtroCategoria) return false;
    if (texto && !`${t.title} ${t.description}`.toLowerCase().includes(texto)) return false;
    return true;
  });

  return (
    <div className="contenedor">
      <div className="barra">
        <div>
          <h1 style={{ margin: 0 }}>HelpDesk IA</h1>
          <small>
            {usuario?.name} ({esTecnico ? "Técnico" : "Usuario"})
          </small>
        </div>
        <button className="secundario" onClick={salir}>Cerrar sesión</button>
      </div>

      {error && <div className="error">{error}</div>}

      {!esTecnico && (
        <div className="tarjeta">
          <h2>Nuevo ticket</h2>
          <form onSubmit={crear}>
            <label>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <label>Descripción</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <button type="submit">Crear ticket</button>
          </form>
        </div>
      )}

      {esTecnico && <Estadisticas tickets={tickets} />}

      <h2>{esTecnico ? "Todos los tickets" : "Mis tickets"}</h2>

      <div className="tarjeta">
        <label style={{ marginTop: 0 }}>Buscar</label>
        <input
          placeholder="Escribe una palabra del título o la descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e.valor} value={e.valor}>{e.texto}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Categoría</label>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="todas">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <small style={{ display: "block", marginTop: 10 }}>
          Mostrando {visibles.length} de {tickets.length} tickets
        </small>
      </div>

      {tickets.length === 0 && <div className="tarjeta">Todavía no hay tickets.</div>}
      {tickets.length > 0 && visibles.length === 0 && (
        <div className="tarjeta">Ningún ticket coincide con los filtros.</div>
      )}

      {visibles.map((t) => (
        <div className="tarjeta" key={t.id}>
          <div className="fila">
            <strong>{t.title}</strong>
            <span className={`etiqueta ${t.status}`}>{textoEstado(t.status)}</span>
          </div>
          <p>{t.description}</p>
          {t.category && <span className="etiqueta">Categoría: {t.category}</span>}
          {t.ai_suggestion && (
            <div className="sugerencia">
              <strong>Sugerencia de IA:</strong> {t.ai_suggestion}
            </div>
          )}
          <div className="fila">
            <small>Prioridad: {t.priority}</small>
            {esTecnico && (
              <select value={t.status} onChange={(e) => cambiarEstado(t.id, e.target.value)}>
                {ESTADOS.map((e) => (
                  <option key={e.valor} value={e.valor}>{e.texto}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}