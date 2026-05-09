/**
 * seed.js — Populate MoneyLens DB with realistic Indian expense data
 * Run: node seed.js
 */
const db = require("./db");

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const prevMonth = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0");
const prevYear = now.getMonth() === 0 ? year - 1 : year;

function d(day, mon = month, yr = year) {
  return `${yr}-${mon}-${String(day).padStart(2, "0")}`;
}

const expenses = [
  // Food
  { amount: 248, description: "Zomato — Butter Chicken + Dal Makhani", category: "Food", merchant: "Zomato", date: d(1) },
  { amount: 129, description: "Swiggy breakfast — Idli Sambar", category: "Food", merchant: "Swiggy", date: d(2) },
  { amount: 720, description: "Dinner at Social, Connaught Place", category: "Food", merchant: "Social", date: d(4) },
  { amount: 355, description: "Zomato — Weekend biryani", category: "Food", merchant: "Zomato", date: d(6) },
  { amount: 85,  description: "McDonald's McAloo Tikki combo", category: "Food", merchant: "McDonald's", date: d(8) },
  { amount: 440, description: "Swiggy — Pizza + garlic bread", category: "Food", merchant: "Swiggy", date: d(10) },
  { amount: 190, description: "Chai Point — office tea runs", category: "Food", merchant: "Chai Point", date: d(12) },
  { amount: 580, description: "Barbeque Nation lunch buffet", category: "Food", merchant: "Barbeque Nation", date: d(14) },
  { amount: 210, description: "Zomato — Shawarma rolls", category: "Food", merchant: "Zomato", date: d(16) },
  { amount: 95,  description: "Domino's — Peppy Paneer pizza", category: "Food", merchant: "Domino's", date: d(18) },

  // Transport
  { amount: 340, description: "Uber — office commute weekly", category: "Transport", merchant: "Uber", date: d(1) },
  { amount: 85,  description: "Auto rickshaw — market & back", category: "Transport", merchant: "Auto", date: d(3) },
  { amount: 420, description: "Ola cab — airport drop", category: "Transport", merchant: "Ola", date: d(7) },
  { amount: 65,  description: "Metro card recharge", category: "Transport", merchant: "DMRC Metro", date: d(9) },
  { amount: 280, description: "Uber — late night ride home", category: "Transport", merchant: "Uber", date: d(15) },
  { amount: 45,  description: "Auto to gym", category: "Transport", merchant: "Auto", date: d(17) },

  // Subscriptions
  { amount: 499, description: "Netflix Premium — monthly", category: "Subscriptions", merchant: "Netflix", date: d(1) },
  { amount: 179, description: "Spotify Premium", category: "Subscriptions", merchant: "Spotify", date: d(1) },
  { amount: 299, description: "Amazon Prime", category: "Subscriptions", merchant: "Amazon", date: d(2) },
  { amount: 199, description: "Hotstar Mobile", category: "Subscriptions", merchant: "Hotstar", date: d(3) },
  { amount: 149, description: "YouTube Premium", category: "Subscriptions", merchant: "YouTube", date: d(4) },

  // Shopping
  { amount: 2499, description: "Myntra — Nike Air Max sneakers", category: "Shopping", merchant: "Myntra", date: d(5) },
  { amount: 899,  description: "Amazon — book haul (5 books)", category: "Shopping", merchant: "Amazon", date: d(8) },
  { amount: 3200, description: "Nykaa — skincare routine products", category: "Shopping", merchant: "Nykaa", date: d(11) },
  { amount: 640,  description: "Flipkart — phone case + charger", category: "Shopping", merchant: "Flipkart", date: d(13) },

  // Entertainment
  { amount: 480, description: "PVR — Pushpa 2 premiere tickets (2x)", category: "Entertainment", merchant: "PVR", date: d(6) },
  { amount: 350, description: "bowling night with friends", category: "Entertainment", merchant: "Smaaash", date: d(14) },
  { amount: 299, description: "BookMyShow — stand-up comedy show", category: "Entertainment", merchant: "BookMyShow", date: d(19) },

  // Health
  { amount: 1200, description: "Gym membership — monthly fee", category: "Health", merchant: "Cult.fit", date: d(1) },
  { amount: 650,  description: "MedPlus — vitamins & supplements", category: "Health", merchant: "MedPlus", date: d(9) },
  { amount: 400,  description: "Doctor consultation — fever", category: "Health", merchant: "Apollo Clinic", date: d(12) },
  { amount: 285,  description: "Pharmacy — antibiotics course", category: "Health", merchant: "Netmeds", date: d(13) },

  // Last month data (for trends)
  { amount: 1850, description: "Zomato + Swiggy orders", category: "Food", merchant: "Zomato", date: d(15, prevMonth, prevYear) },
  { amount: 620,  description: "Uber rides", category: "Transport", merchant: "Uber", date: d(10, prevMonth, prevYear) },
  { amount: 1125, description: "Subscriptions (Netflix/Spotify/Prime)", category: "Subscriptions", merchant: "Netflix", date: d(1, prevMonth, prevYear) },
  { amount: 4200, description: "Shopping — clothes & accessories", category: "Shopping", merchant: "Myntra", date: d(20, prevMonth, prevYear) },
  { amount: 900,  description: "Movies + bowling", category: "Entertainment", merchant: "PVR", date: d(18, prevMonth, prevYear) },
  { amount: 1800, description: "Gym + medicines", category: "Health", merchant: "Cult.fit", date: d(5, prevMonth, prevYear) },
];

// Clear existing and reseed
db.prepare("DELETE FROM expenses").run();
const stmt = db.prepare(
  `INSERT INTO expenses (amount, description, category, merchant, date) VALUES (@amount, @description, @category, @merchant, @date)`
);
const insertMany = db.transaction((rows) => {
  for (const row of rows) stmt.run(row);
});
insertMany(expenses);

console.log(`✅ Seeded ${expenses.length} expenses into MoneyLens DB`);
console.log(`   Current month (${year}-${month}): ${expenses.filter(e => e.date.startsWith(`${year}-${month}`)).length} entries`);
console.log(`   Previous month: ${expenses.filter(e => e.date.startsWith(`${prevYear}-${prevMonth}`)).length} entries`);
