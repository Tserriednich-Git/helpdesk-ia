# HelpDesk IA

Sistema de tickets de soporte técnico con React (Vite), Node.js (Express) y SQLite.

Este README cubre la **Fase 1**: estructura del proyecto, instalación y cómo arrancar frontend y backend en Windows.

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
├── client/          # Frontend React + Vite
├── server/          # Backend Express + SQLite
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

La primera vez que arranca, se crea el archivo SQLite `server\data\helpdesk.db` con las tablas `users` y `tickets`.

Comprueba que la API responde:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

### 2. Arrancar el cliente (React)

En otra ventana de PowerShell:

```powershell
cd C:\ruta\a\helpdesk-ia\client
npm run dev
```

Abre en el navegador la URL que muestre Vite (normalmente `http://localhost:5173`).

## Scripts útiles

| Dónde    | Comando        | Qué hace                                      |
|----------|----------------|-----------------------------------------------|
| `client` | `npm run dev`  | Servidor de desarrollo de Vite                |
| `client` | `npm run build`| Genera la versión de producción en `dist`     |
| `server` | `npm run dev`  | Express con recarga automática (nodemon)      |
| `server` | `npm start`    | Express sin recarga automática                |

## Base de datos (Fase 1)

SQLite usa el módulo nativo `node:sqlite` de Node.js (no hace falta instalar un paquete extra).

Tablas:

- **users**: `id`, `name`, `email`, `password`, `role` (`user`, `agent`, `admin`), `created_at`
- **tickets**: `id`, `title`, `description`, `status` (`open`, `in_progress`, `closed`), `priority` (`low`, `medium`, `high`), `user_id`, `created_at`, `updated_at`

El archivo `.db` está en `.gitignore`: no se sube a Git. Se regenera al arrancar el servidor.

## Notas

- No subas archivos `.env` ni `node_modules`.
- En esta fase todavía no hay login, pantallas de tickets ni inteligencia artificial.
