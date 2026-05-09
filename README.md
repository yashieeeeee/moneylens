# 🪙 MoneyLens

AI-powered expense tracker. Add expenses in plain English — MoneyLens parses, stores, and analyzes your spending with Groq (LLaMA 3.3 70B).

## Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React + Vite + Recharts |
| Backend   | Node.js + Express + SQLite |
| AI        | Groq API (LLaMA 3.3 70B) |
| Deploy    | Vercel (frontend) + Render (backend) |

---ss

## Local Development

### 1. Backend

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm install
npm run seed   # optional: load sample data
npm run dev    # runs on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # runs on http://localhost:5173
```

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)
   - `FRONTEND_URL` = your Vercel URL (add after frontend is deployed)
7. Copy your Render URL (e.g. `https://moneylens-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import your repo
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL from above
5. Deploy!
6. Copy your Vercel URL and add it as `FRONTEND_URL` in your Render service

---

## Usage

Just type what you spent:
- `"Spent 250 on Zomato"`
- `"Netflix 499"`
- `"Uber to office 180"`

MoneyLens will parse the amount, merchant, category, and date automatically.