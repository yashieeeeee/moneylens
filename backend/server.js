require("dotenv").config();
const express = require("express");
const { init } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - must be first, works even when routes crash
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/insights", require("./routes/insights"));
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

init()
  .then(() => app.listen(PORT, () => console.log(`🪙 MoneyLens running on http://localhost:${PORT}`)))
  .catch((err) => { console.error("DB init failed:", err); process.exit(1); });