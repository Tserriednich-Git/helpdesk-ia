import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, guardarSesion } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("usuario");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const ruta = modoRegistro ? "/auth/register" : "/auth/login";
      const body = modoRegistro ? { name, email, password, role } : { email, password };
      const datos = await api(ruta, { method: "POST", body });
      guardarSesion(datos.token, datos.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="contenedor" style={{ maxWidth: 420 }}>
      <div className="tarjeta">
        <h1>HelpDesk IA</h1>
        <h2>{modoRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>

        <form onSubmit={enviar}>
          {modoRegistro && (
            <>
              <label>Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </>
          )}

          <label>Correo</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {modoRegistro && (
            <>
              <label>Rol</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="usuario">Usuario</option>
                <option value="tecnico">Técnico</option>
              </select>
            </>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Enviando..." : modoRegistro ? "Registrarme" : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          className="enlace"
          onClick={() => { setModoRegistro(!modoRegistro); setError(""); }}
        >
          {modoRegistro ? "Ya tengo cuenta, iniciar sesión" : "No tengo cuenta, registrarme"}
        </button>
      </div>
    </div>
  );
}