const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "helpdesk.db");

let db;

function getDatabase() {
  if (!db) {
    throw new Error("La base de datos no está inicializada. Llama a initDatabase() primero.");
  }
  return db;
}

function tableSql(name) {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(name);
  return row ? row.sql : "";
}

function initDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new DatabaseSync(dbPath);

  // Si la base viene de la Fase 1 (roles en inglés), se recrean las tablas.
  const usersSql = tableSql("users");
  const ticketsSql = tableSql("tickets");
  const esquemaAntiguo =
    (usersSql && (usersSql.includes("'user'") || usersSql.includes("'agent'"))) ||
    (ticketsSql && (ticketsSql.includes("'open'") || ticketsSql.includes("'closed'")));

  if (esquemaAntiguo) {
    db.exec(`
      DROP TABLE IF EXISTS tickets;
      DROP TABLE IF EXISTS users;
    `);
    console.log("Se actualizó el esquema de la base de datos (Fase 2). Los datos antiguos se eliminaron.");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'usuario' CHECK(role IN ('usuario', 'tecnico')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'abierto' CHECK(status IN ('abierto', 'en_proceso', 'resuelto')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log(`Base de datos lista: ${dbPath}`);
  return db;
}

module.exports = {
  initDatabase,
  getDatabase,
};
