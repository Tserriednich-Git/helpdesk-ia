import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, cerrarSesion, obtenerUsuario } from "./api";

const ESTADOS = [
  { valor: "abierto", texto: "Abierto" },
  { valor: "en_proceso", texto: "En proceso" },
  { valor: "resuelto", texto: "Resuelto" },
];

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

      <h2>{esTecnico ? "Todos los tickets" : "Mis tickets"}</h2>

      {tickets.length === 0 && <div className="tarjeta">Todavía no hay tickets.</div>}

      {tickets.map((t) => (
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