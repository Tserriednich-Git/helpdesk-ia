const express = require("express");
const { getDatabase } = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
const ESTADOS = ["abierto", "en_proceso", "resuelto"];

function normalizarEstado(valor) {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim().toLowerCase().replace(/\s+/g, "_");
  if (limpio === "en_proceso" || limpio === "enproceso") return "en_proceso";
  if (ESTADOS.includes(limpio)) return limpio;
  return null;
}

function ticketVisiblePara(user, ticket) {
  if (!ticket) return false;
  if (user.role === "tecnico") return true;
  return ticket.user_id === user.id;
}

router.use(authRequired);

router.post("/", (req, res) => {
  const { title, description } = req.body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "El título es obligatorio." });
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "La descripción es obligatoria." });
  }

  const db = getDatabase();
  const result = db
    .prepare("INSERT INTO tickets (title, description, user_id) VALUES (?, ?, ?)")
    .run(title.trim(), description.trim(), req.user.id);

  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(Number(result.lastInsertRowid));
  res.status(201).json({ ticket });
});

router.get("/", (req, res) => {
  const db = getDatabase();
  const tickets =
    req.user.role === "tecnico"
      ? db.prepare("SELECT * FROM tickets ORDER BY created_at DESC").all()
      : db.prepare("SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);

  res.json({ tickets });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Identificador de ticket no válido." });
  }

  const db = getDatabase();
  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket no encontrado." });
  }
  if (!ticketVisiblePara(req.user, ticket)) {
    return res.status(403).json({ error: "No puedes ver tickets de otras personas." });
  }

  res.json({ ticket });
});

router.patch("/:id/estado", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Identificador de ticket no válido." });
  }

  const estado = normalizarEstado(req.body && req.body.status);
  if (!estado) {
    return res.status(400).json({
      error: 'El estado debe ser "abierto", "en_proceso" (o "en proceso") o "resuelto".',
    });
  }

  const db = getDatabase();
  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket no encontrado." });
  }
  if (!ticketVisiblePara(req.user, ticket)) {
    return res.status(403).json({ error: "No puedes cambiar tickets de otras personas." });
  }

  db.prepare("UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?").run(estado, id);
  const actualizado = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);
  res.json({ ticket: actualizado });
});

module.exports = router;
