const express = require("express");
const router = express.Router();
const { db } = require("../db");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const CATEGORIES = ["Food","Transport","Subscriptions","Shopping","Entertainment","Health","Other"];

async function callGroq(system, user) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user }
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

// GET /api/expenses
router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    const r = month
      ? await db.execute({ sql: `SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC, id DESC`, args: [`${month}%`] })
      : await db.execute(`SELECT * FROM expenses ORDER BY date DESC, id DESC`);
    res.json({ expenses: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/expenses/parse
router.post("/parse", async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text is required" });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });
  try {
    const system = `Parse Indian expense input. Return JSON only:
{"amount":<INR number>,"description":"<short>","category":"<one of: ${CATEGORIES.join(", ")}>","merchant":"<brand>"}
Rules: Zomato/Swiggy=Food, Uber/Ola=Transport, Netflix/Spotify=Subscriptions, Amazon/Flipkart=Shopping, PVR/BookMyShow=Entertainment, doctor/gym/Apollo=Health, else=Other.`;
    const parsed = JSON.parse(await callGroq(system, `Parse: "${text}"`));
    if (!parsed.amount || isNaN(Number(parsed.amount)))
      return res.status(422).json({ error: `Could not parse amount from: "${text}"` });
    const r = await db.execute({
      sql: `INSERT INTO expenses (amount, description, category, merchant, date) VALUES (?, ?, ?, ?, ?)`,
      args: [
        Number(parsed.amount),
        parsed.description || text,
        CATEGORIES.includes(parsed.category) ? parsed.category : "Other",
        parsed.merchant || "",
        new Date().toISOString().split("T")[0],
      ],
    });
    const row = await db.execute({ sql: `SELECT * FROM expenses WHERE id = ?`, args: [r.lastInsertRowid] });
    res.json({ expense: row.rows[0], parsed });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// POST /api/expenses (manual add)
router.post("/", async (req, res) => {
  const { amount, description, category, merchant, date } = req.body;
  if (!amount || !description) return res.status(400).json({ error: "amount and description required" });
  try {
    const r = await db.execute({
      sql: `INSERT INTO expenses (amount, description, category, merchant, date) VALUES (?, ?, ?, ?, ?)`,
      args: [
        parseFloat(amount), description,
        CATEGORIES.includes(category) ? category : "Other",
        merchant || "",
        date || new Date().toISOString().split("T")[0],
      ],
    });
    const row = await db.execute({ sql: `SELECT * FROM expenses WHERE id = ?`, args: [r.lastInsertRowid] });
    res.json({ expense: row.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.execute({ sql: `DELETE FROM expenses WHERE id = ?`, args: [req.params.id] });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/expenses/stats
router.get("/stats", async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  try {
    const [totals, byCategory, byDay] = await Promise.all([
      db.execute({ sql: `SELECT COALESCE(SUM(amount),0) as total, COUNT(*) as count FROM expenses WHERE date LIKE ?`, args: [`${month}%`] }),
      db.execute({ sql: `SELECT category, SUM(amount) as total FROM expenses WHERE date LIKE ? GROUP BY category ORDER BY total DESC`, args: [`${month}%`] }),
      db.execute({ sql: `SELECT date, SUM(amount) as total FROM expenses WHERE date LIKE ? GROUP BY date ORDER BY date ASC`, args: [`${month}%`] }),
    ]);
    res.json({
      total: totals.rows[0].total,
      count: totals.rows[0].count,
      byCategory: byCategory.rows,
      byDay: byDay.rows,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;