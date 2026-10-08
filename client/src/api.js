const TOKEN_KEY = "helpdesk_token";
const USER_KEY = "helpdesk_user";

export function guardarSesion(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerUsuario() {
  const texto = localStorage.getItem(USER_KEY);
  return texto ? JSON.parse(texto) : null;
}

export async function api(ruta, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = obtenerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || "Ocurrió un error inesperado.");
  }
  return datos;
}