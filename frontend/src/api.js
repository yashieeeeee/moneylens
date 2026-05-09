const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function req(method, path, body, token) {
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

export function createApi(token) {
  return {
    getExpenses:   (month) => req("GET",    `/expenses${month ? `?month=${month}` : ""}`, null, token),
    parseExpense:  (text)  => req("POST",   "/expenses/parse", { text }, token),
    addExpense:    (data)  => req("POST",   "/expenses", data, token),
    deleteExpense: (id)    => req("DELETE", `/expenses/${id}`, null, token),
    getStats:      (month) => req("GET",    `/expenses/stats${month ? `?month=${month}` : ""}`, null, token),
    getInsights:   (month) => req("GET",    `/insights${month ? `?month=${month}` : ""}`, null, token),
    getReport:     (month) => req("GET",    `/insights/report${month ? `?month=${month}` : ""}`, null, token),
  };
}