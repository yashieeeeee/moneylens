const express = require("express");
const router = express.Router();
const db = require("../db");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(userMessage, maxTokens = 1024, jsonMode = false) {
  const body = {
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: userMessage }],
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

/**
 * Strips markdown fences and extracts a JSON array from the model's raw output.
 * Handles: plain array, ```json ... ```, json_object wrapper like {"insights":[...]}.
 */
function extractJSONArray(text) {
  // 1. Strip markdown code fences
  let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  // 2. Try direct parse first (json_object mode wraps in an object)
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    // Groq json_object mode → find first array value in the object
    const arrayVal = Object.values(parsed).find(v => Array.isArray(v));
    if (arrayVal) return arrayVal;
  } catch (_) { /* fall through to bracket extraction */ }

  // 3. Bracket extraction fallback
  const start = cleaned.indexOf("[");
  const end   = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1) return JSON.parse(cleaned.slice(start, end + 1));

  throw new Error("Could not extract a JSON array from the AI response. Raw: " + cleaned.slice(0, 200));
}

// GET /api/insights?month=YYYY-MM
router.get("/", async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const expenses = db.prepare(`SELECT * FROM expenses WHERE date LIKE ? ORDER BY date ASC`).all(`${month}%`);

  if (expenses.length === 0) {
    return res.json({
      insights: [{ title: "No data yet", message: "Add your first expense using the Add Expense tab.", type: "info" }],
    });
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  const catSummary = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([c, a]) => `${c}: Rs.${Math.round(a)}`).join(", ");

  const topMerchants = expenses.reduce((acc, e) => {
    if (e.merchant) acc[e.merchant] = (acc[e.merchant] || 0) + e.amount;
    return acc;
  }, {});
  const merchantSummary = Object.entries(topMerchants)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([m, a]) => `${m}: Rs.${Math.round(a)}`).join(", ");

  const prompt = `You are a personal finance advisor for Indian users. Analyze this spending data and return valid JSON only.

Month: ${month}
Total spent: Rs.${Math.round(total)}
Transactions: ${expenses.length}
By category: ${catSummary}
Top merchants: ${merchantSummary}

Return a JSON object with a single key "insights" containing exactly 4 insight objects:
{
  "insights": [
    {"title": "short title max 8 words", "message": "2-3 sentences with specific Rs amounts and actionable advice", "type": "warning", "savings": 500},
    ...
  ]
}
Type must be one of: warning (overspending), success (good habit), info (neutral tip).
savings field is optional - only include if there is a concrete monthly saving amount.
Reference actual merchant names. Be specific with rupee amounts.`;

  try {
    const raw = await callGroq(prompt, 1024, true); // jsonMode = true
    console.log("Groq insights raw:", raw);
    const insights = extractJSONArray(raw);
    res.json({ insights, month, total, byCategory });
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/insights/report?month=YYYY-MM
router.get("/report", async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const expenses = db.prepare(`SELECT * FROM expenses WHERE date LIKE ? ORDER BY date ASC`).all(`${month}%`);

  if (expenses.length === 0) return res.json({ report: "No expenses found for this month." });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  const catLines = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([c, a]) => `  - ${c}: Rs.${Math.round(a)} (${Math.round((a / total) * 100)}%)`)
    .join("\n");

  const prompt = `Write a friendly, concise monthly expense report for an Indian user. Keep it under 250 words. Use plain text with clear sections (no markdown headers, no bullet symbols). Include: a 2-line summary, the biggest spend areas, and 2-3 specific actionable savings tips with rupee amounts.

Month: ${month}
Total: Rs.${Math.round(total)}
Transactions: ${expenses.length}
Breakdown:
${catLines}`;

  try {
    const report = await callGroq(prompt, 600);
    res.json({ report, month, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;