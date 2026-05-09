const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

function getToken() {
  return localStorage.getItem("ml_token");
}

async function req(method, path, body) {
  const token = getToken();
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  signup: (email, password, name) => req("POST", "/auth/signup", { email, password, name }),
  login:  (email, password)       => req("POST", "/auth/login",  { email, password }),

  // Expenses
  getExpenses:   (month) => req("GET",    `/expenses${month ? `?month=${month}` : ""}`),
  parseExpense:  (text)  => req("POST",   "/expenses/parse", { text }),
  addExpense:    (data)  => req("POST",   "/expenses", data),
  deleteExpense: (id)    => req("DELETE", `/expenses/${id}`),
  getStats:      (month) => req("GET",    `/expenses/stats${month ? `?month=${month}` : ""}`),
  getInsights:   (month) => req("GET",    `/insights${month ? `?month=${month}` : ""}`),
  getReport:     (month) => req("GET",    `/insights/report${month ? `?month=${month}` : ""}`),
};