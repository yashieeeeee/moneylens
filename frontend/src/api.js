import { useAuth } from "@clerk/clerk-react";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function req(method, path, body, getToken) {
  const token = await getToken();
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
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

export function useApi() {
  const { getToken } = useAuth();
  const call = (method, path, body) => req(method, path, body, getToken);
  return {
    getExpenses:   (month) => call("GET",    `/expenses${month ? `?month=${month}` : ""}`),
    parseExpense:  (text)  => call("POST",   "/expenses/parse", { text }),
    addExpense:    (data)  => call("POST",   "/expenses", data),
    deleteExpense: (id)    => call("DELETE", `/expenses/${id}`),
    getStats:      (month) => call("GET",    `/expenses/stats${month ? `?month=${month}` : ""}`),
    getInsights:   (month) => call("GET",    `/insights${month ? `?month=${month}` : ""}`),
    getReport:     (month) => call("GET",    `/insights/report${month ? `?month=${month}` : ""}`),
  };
}