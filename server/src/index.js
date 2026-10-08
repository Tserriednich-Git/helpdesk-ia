require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./db");
const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error("Falta JWT_SECRET en el archivo .env. Copia .env.example a .env y pon una clave larga.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "HelpDesk IA API en ejecución" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
