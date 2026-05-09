const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email.toLowerCase()],
    });
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.execute({
      sql: `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
      args: [email.toLowerCase(), hash, name || email.split("@")[0]],
    });
    const token = jwt.sign({ userId: String(result.lastInsertRowid), email }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: String(result.lastInsertRowid), email, name: name || email.split("@")[0] } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email.toLowerCase()],
    });
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign({ userId: String(user.id), email: user.email }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: String(user.id), email: user.email, name: user.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;