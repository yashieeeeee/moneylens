require("dotenv").config();
const express = require("express");
const cors = require("cors");

const expensesRouter = require("./routes/expenses");
const insightsRouter = require("./routes/insights");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS: origin not allowed"));
  },
}));
app.use(express.json());

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.use("/api/expenses", expensesRouter);
app.use("/api/insights", insightsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🪙  MoneyLens backend running on http://localhost:${PORT}\n`);
});