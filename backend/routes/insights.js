const express = require("express");
const router = express.Router();
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";


async function callGroq(message, maxTokens = 1024, jsonMode = false) {
  const body = {
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: message }],
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
}

function extractJSONArray(text) {
  let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    const arr = Object.values(parsed).find(v => Array.isArray(v));
    if (arr) return arr;
  } catch (_) {}
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1) return JSON.parse(cleaned.slice(start, end + 1));
  throw new Error("Could not extract JSON array from AI response");
}

// GET /api/insights
router.get("/", async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  try {
    const result = await db.execute({
  sql: `SELECT * FROM expenses WHERE user_id = ? AND date LIKE ? ORDER BY date ASC`,
  args: [req.userId, `${month}%`],
});
    const expenses = result.rows;

    if (expenses.length === 0) {
      return res.json({
        insights: [{ title: "No data yet", message: "Add your first expense using the Add Expense tab.", type: "info" }],
      });
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const catSummary = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([c,a])=>`${c}: Rs.${Math.round(a)}`).join(", ");
    const topMerchants = expenses.reduce((acc, e) => { if (e.merchant) acc[e.merchant] = (acc[e.merchant]||0)+e.amount; return acc; }, {});
    const merchantSummary = Object.entries(topMerchants).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([m,a])=>`${m}: Rs.${Math.round(a)}`).join(", ");

    const prompt = `You are a personal finance advisor for Indian users. Analyze this spending data and return valid JSON only.
Month: ${month}, Total: Rs.${Math.round(total)}, Transactions: ${expenses.length}
By category: ${catSummary}
Top merchants: ${merchantSummary}

Return this JSON structure with exactly 4 insights:
{"insights":[{"title":"max 8 words","message":"2-3 sentences with Rs amounts and advice","type":"warning","savings":500}]}
type must be: warning, success, or info. savings is optional (only if concrete amount).`;

    const raw = await callGroq(prompt, 1024, true);
    const insights = extractJSONArray(raw);
    res.json({ insights, month, total, byCategory });
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/insights/report
router.get("/report", async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  try {
    const result = await db.execute({
  sql: `SELECT * FROM expenses WHERE user_id = ? AND date LIKE ? ORDER BY date ASC`,
  args: [req.userId, `${month}%`],
});
    const expenses = result.rows;
    if (expenses.length === 0) return res.json({ report: "No expenses found for this month." });

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category]||0)+e.amount; });
    const catLines = Object.entries(byCategory).sort((a,b)=>b[1]-a[1])
      .map(([c,a])=>`${c}: Rs.${Math.round(a)} (${Math.round(a/total*100)}%)`).join("\n");

    const prompt = `Write a friendly monthly expense report for an Indian user. Plain text only, no markdown, under 250 words. Include: 2-line summary, biggest spend areas, 2-3 savings tips with rupee amounts.
Month: ${month}, Total: Rs.${Math.round(total)}, Transactions: ${expenses.length}
Breakdown:\n${catLines}`;

    const report = await callGroq(prompt, 600);
    res.json({ report, month, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;