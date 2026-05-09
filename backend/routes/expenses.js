const express = require("express");
const router = express.Router();
const db = require("../db");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const CATEGORIES = ["Food", "Transport", "Subscriptions", "Shopping", "Entertainment", "Health", "Other"];

async function callGroq(systemPrompt, userMessage) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 256,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractJSON(text) {
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return JSON.parse(text.slice(start, end + 1));
  throw new Error("No JSON object found in response");
}

// GET /api/expenses
router.get("/", (req, res) => {
  try {
    const { month } = req.query;
    const rows = month
      ? db.prepare(`SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC, id DESC`).all(`${month}%`)
      : db.prepare(`SELECT * FROM expenses ORDER BY date DESC, id DESC`).all();
    res.json({ expenses: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/expenses/parse — natural language to expense
router.post("/parse", async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text is required" });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set in backend/.env" });

  try {
    const system = `You are an expense parser for Indian users. Parse the input and return ONLY a raw JSON object (no markdown, no backticks):
{"amount": <number in INR>, "description": "<short desc>", "category": "<one of: ${CATEGORIES.join(", ")}>", "merchant": "<brand/app name>"}

Category rules:
- Zomato, Swiggy, restaurant, food, lunch, dinner, breakfast, chai = Food
- Uber, Ola, auto, rickshaw, metro, cab, petrol = Transport
- Netflix, Spotify, Amazon Prime, Hotstar, YouTube Premium = Subscriptions
- Amazon, Flipkart, Myntra, Nykaa, shopping, clothes = Shopping
- PVR, BookMyShow, movie, cinema, bowling, gaming = Entertainment
- doctor, hospital, medicine, pharmacy, MedPlus, Apollo, gym, Cult.fit = Health
- anything else = Other`;

    const raw = await callGroq(system, `Parse this expense: "${text}"`);
    console.log("Groq raw:", raw);
    const parsed = extractJSON(raw);

    if (!parsed.amount || isNaN(Number(parsed.amount))) {
      return res.status(422).json({ error: `Could not parse amount from: "${text}". Try "Spent 500 on Zomato"` });
    }

    const info = db.prepare(
      `INSERT INTO expenses (amount, description, category, merchant, date) VALUES (@amount, @description, @category, @merchant, @date)`
    ).run({
      amount:      Number(parsed.amount),
      description: parsed.description || text,
      category:    CATEGORIES.includes(parsed.category) ? parsed.category : "Other",
      merchant:    parsed.merchant || "",
      date:        new Date().toISOString().split("T")[0],
    });

    const expense = db.prepare(`SELECT * FROM expenses WHERE id = ?`).get(info.lastInsertRowid);
    res.json({ expense, parsed });
  } catch (err) {
    console.error("Parse error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses — manual add
router.post("/", (req, res) => {
  const { amount, description, category, merchant, date } = req.body;
  if (!amount || !description) return res.status(400).json({ error: "amount and description required" });
  try {
    const info = db.prepare(
      `INSERT INTO expenses (amount, description, category, merchant, date) VALUES (@amount, @description, @category, @merchant, @date)`
    ).run({
      amount: parseFloat(amount), description,
      category: CATEGORIES.includes(category) ? category : "Other",
      merchant: merchant || "",
      date: date || new Date().toISOString().split("T")[0],
    });
    const expense = db.prepare(`SELECT * FROM expenses WHERE id = ?`).get(info.lastInsertRowid);
    res.json({ expense });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/expenses/:id
router.delete("/:id", (req, res) => {
  try {
    db.prepare(`DELETE FROM expenses WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/expenses/stats
router.get("/stats", (req, res) => {
  const filter = `${req.query.month || new Date().toISOString().slice(0, 7)}%`;
  try {
    const total = db.prepare(
      `SELECT COALESCE(SUM(amount),0) as total, COUNT(*) as count FROM expenses WHERE date LIKE ?`
    ).get(filter);
    const byCategory = db.prepare(
      `SELECT category, SUM(amount) as total FROM expenses WHERE date LIKE ? GROUP BY category ORDER BY total DESC`
    ).all(filter);
    const byDay = db.prepare(
      `SELECT date, SUM(amount) as total FROM expenses WHERE date LIKE ? GROUP BY date ORDER BY date ASC`
    ).all(filter);
    res.json({ total: total.total, count: total.count, byCategory, byDay });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
