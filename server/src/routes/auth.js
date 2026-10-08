const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDatabase } = require("../db");
const { authRequired, publicUser } = require("../middleware/auth");

const router = express.Router();
const ROLES = ["usuario", "tecnico"];

function crearToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function emailValido(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "El nombre es obligatorio." });
  }
  if (!emailValido(email)) {
    return res.status(400).json({ error: "Indica un correo electrónico válido." });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const rolFinal = role || "usuario";
  if (!ROLES.includes(rolFinal)) {
    return res.status(400).json({ error: 'El rol debe ser "usuario" o "tecnico".' });
  }

  const db = getDatabase();
  const existe = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (existe) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    .run(name.trim(), email.toLowerCase().trim(), hash, rolFinal);

  const user = db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(Number(result.lastInsertRowid));

  const token = crearToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!emailValido(email) || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  const db = getDatabase();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());

  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  const user = publicUser(row);
  const token = crearToken(user);
  res.json({ token, user });
});

router.get("/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
