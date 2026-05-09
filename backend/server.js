require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS: origin not allowed"));
  },
}));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/insights", require("./routes/insights"));
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => res.status(500).json({ error: "Internal server error" }));

init()
  .then(() => app.listen(PORT, () => console.log(`🪙 MoneyLens running on http://localhost:${PORT}`)))
  .catch((err) => { console.error("DB init failed:", err); process.exit(1); });