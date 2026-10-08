# HelpDesk IA

Sistema de tickets de soporte técnico con React (Vite), Node.js (Express) y SQLite.

Este README cubre hasta la **Fase 2**: autenticación (JWT + bcrypt) y rutas de tickets en el servidor.

## Requisitos

- Windows 10 o 11
- [Node.js](https://nodejs.org/) v20 o superior (incluye `npm`)
- PowerShell

Comprueba las versiones:

```powershell
node -v
npm -v
```

## Estructura

```
helpdesk-ia/
├── client/                 # Frontend React + Vite
├── server/
│   ├── src/                # Express, SQLite, auth y tickets
│   ├── .env.example        # Plantilla de variables (sin secretos reales)
│   └── probar-api.ps1      # Ejemplos Invoke-RestMethod
├── .gitignore
└── README.md
```

## Instalación (solo la primera vez)

Abre PowerShell en la carpeta del proyecto.

Instala las dependencias del **cliente**:

```powershell
cd client
npm install
cd ..
```

Instala las dependencias del **servidor**:

```powershell
cd server
npm install
cd ..
```

Copia el archivo de ejemplo de variables de entorno (si aún no existe `server\.env`):

```powershell
Copy-Item server\.env.example server\.env
```

En `server\.env` cambia `JWT_SECRET` por un texto largo y aleatorio. Ese archivo no se sube a Git (está en `.gitignore`).

## Cómo ejecutarlo en Windows

Necesitas **dos ventanas de PowerShell** (una para el frontend y otra para el backend).

### 1. Arrancar el servidor (API + base de datos)

```powershell
cd C:\ruta\a\helpdesk-ia\server
npm run dev
```

Deberías ver algo como:

- `Base de datos lista: ...\server\data\helpdesk.db`
- `Servidor escuchando en http://localhost:3001`

Comprueba que la API responde:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Para probar registro, login y tickets (con el servidor en marcha):

```powershell
cd C:\ruta\a\helpdesk-ia\server
.\probar-api.ps1
```

### 2. Arrancar el cliente (React)

En otra ventana de PowerShell:

```powershell
cd C:\ruta\a\helpdesk-ia\client
npm run dev
```

Abre en el navegador la URL que muestre Vite (normalmente `http://localhost:5173`). El frontend de tickets/login se hará en una fase posterior.

## Scripts útiles

| Dónde    | Comando        | Qué hace                                      |
|----------|----------------|-----------------------------------------------|
| `client` | `npm run dev`  | Servidor de desarrollo de Vite                |
| `client` | `npm run build`| Genera la versión de producción en `dist`     |
| `server` | `npm run dev`  | Express con recarga automática (nodemon)      |
| `server` | `npm start`    | Express sin recarga automática                |

## API (Fase 2)

Todas las rutas de tickets llevan el encabezado `Authorization: Bearer <token>` que devuelven registro e inicio de sesión.

| Método | Ruta | Quién | Qué hace |
|--------|------|--------|----------|
| POST | `/api/auth/register` | público | Crear cuenta (`usuario` o `tecnico`) |
| POST | `/api/auth/login` | público | Iniciar sesión y obtener token |
| GET | `/api/auth/me` | con token | Ver el usuario del token |
| POST | `/api/tickets` | con token | Crear ticket (queda asociado a quien lo crea) |
| GET | `/api/tickets` | con token | Listar: el usuario ve los suyos; el técnico ve todos |
| GET | `/api/tickets/:id` | con token | Ver un ticket (mismas reglas) |
| PATCH | `/api/tickets/:id/estado` | con token | Cambiar estado: `abierto`, `en_proceso`, `resuelto` |

## Base de datos

SQLite usa el módulo nativo `node:sqlite` de Node.js.

Tablas:

- **users**: `id`, `name`, `email`, `password` (hash bcrypt), `role` (`usuario`, `tecnico`), `created_at`
- **tickets**: `id`, `title`, `description`, `status` (`abierto`, `en_proceso`, `resuelto`), `priority`, `user_id`, `created_at`, `updated_at`

Si tenías una base de la Fase 1 (roles en inglés), al arrancar se recrean las tablas y se pierden esos datos de prueba.

El archivo `.db` está en `.gitignore`.

## Notas

- No subas archivos `.env` ni `node_modules`.
- Aún no hay pantallas de login/tickets en React ni inteligencia artificial (Fase 3 en adelante).
