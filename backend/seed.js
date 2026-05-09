require("dotenv").config();
const { db, init } = require("./db");

const expenses = [
  { amount: 249,  description: "Zomato order",        category: "Food",          merchant: "Zomato",   date: "2026-05-01" },
  { amount: 499,  description: "Netflix subscription", category: "Subscriptions", merchant: "Netflix",  date: "2026-05-02" },
  { amount: 180,  description: "Uber to office",       category: "Transport",     merchant: "Uber",     date: "2026-05-03" },
  { amount: 650,  description: "Medicines at Apollo",  category: "Health",        merchant: "Apollo",   date: "2026-05-04" },
  { amount: 120,  description: "Swiggy breakfast",     category: "Food",          merchant: "Swiggy",   date: "2026-05-05" },
  { amount: 1299, description: "Amazon order",         category: "Shopping",      merchant: "Amazon",   date: "2026-05-06" },
  { amount: 480,  description: "PVR movie tickets",    category: "Entertainment", merchant: "PVR",      date: "2026-05-07" },
  { amount: 1200, description: "Gym membership",       category: "Health",        merchant: "Cult.fit", date: "2026-05-08" },
  { amount: 379,  description: "Spotify Premium",      category: "Subscriptions", merchant: "Spotify",  date: "2026-05-09" },
  { amount: 340,  description: "Zomato dinner",        category: "Food",          merchant: "Zomato",   date: "2026-05-10" },
];

async function seed() {
  await init();
  for (const e of expenses) {
    await db.execute({
      sql: `INSERT INTO expenses (amount, description, category, merchant, date) VALUES (?, ?, ?, ?, ?)`,
      args: [e.amount, e.description, e.category, e.merchant, e.date],
    });
  }
  console.log(`Seeded ${expenses.length} expenses`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });