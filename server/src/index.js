require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "HelpDesk IA API en ejecución" });
});

initDatabase();

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
