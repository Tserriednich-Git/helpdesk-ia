const jwt = require("jsonwebtoken");
const { getDatabase } = require("../db");

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
  };
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Necesitas iniciar sesión. Envía el token en el encabezado Authorization: Bearer <token>",
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Token inválido o caducado. Vuelve a iniciar sesión." });
  }

  const db = getDatabase();
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(payload.id);

  if (!user) {
    return res.status(401).json({ error: "El usuario del token ya no existe." });
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permiso para esta acción." });
    }
    next();
  };
}

module.exports = {
  authRequired,
  requireRole,
  publicUser,
};
