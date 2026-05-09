const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function req(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  getExpenses:   (month) => req("GET",    `/expenses${month ? `?month=${month}` : ""}`),
  parseExpense:  (text)  => req("POST",   "/expenses/parse", { text }),
  addExpense:    (data)  => req("POST",   "/expenses", data),
  deleteExpense: (id)    => req("DELETE", `/expenses/${id}`),
  getStats:      (month) => req("GET",    `/expenses/stats${month ? `?month=${month}` : ""}`),
  getInsights:   (month) => req("GET",    `/insights${month ? `?month=${month}` : ""}`),
  getReport:     (month) => req("GET",    `/insights/report${month ? `?month=${month}` : ""}`),
};