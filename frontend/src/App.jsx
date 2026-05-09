import { useAuth, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChatEntry from "./components/ChatEntry";
import Insights from "./components/Insights";
import History from "./components/History";
import { createApi } from "./api";
import { currentMonth } from "./config";

const NAV_ITEMS = [
  { id: "overview", icon: "◈",  label: "Overview" },
  { id: "add",      icon: "＋", label: "Add" },
  { id: "insights", icon: "✦",  label: "Insights" },
  { id: "history",  icon: "≡",  label: "History" },
];

const PAGE_META = {
  overview: { title: "Overview",    sub: "Your financial snapshot" },
  add:      { title: "Add Expense", sub: "Just say what you spent" },
  insights: { title: "AI Insights", sub: "Powered by Groq · LLaMA 3.3" },
  history:  { title: "History",     sub: "All transactions" },
};

export default function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [tab, setTab] = useState("overview");
  const [refresh, setRefresh] = useState(0);
  const [headerStats, setHeaderStats] = useState({ total: null, count: null });
  const [api, setApi] = useState(null);

  function bump() { setRefresh((r) => r + 1); }

  // Build api object once token is available
  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then((token) => {
      setApi(createApi(token));
    });
  }, [isSignedIn, refresh]);

  // Fetch header stats once api is ready
  useEffect(() => {
    if (!api) return;
    api.getStats(currentMonth())
      .then((s) => setHeaderStats({ total: s.total, count: s.count }))
      .catch(() => {});
  }, [api]);

  if (!isLoaded) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ color: "var(--text3)", fontSize: 13 }}>Loading…</div>
    </div>
  );

  if (!isSignedIn) return <Login />;

  const page = PAGE_META[tab];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div className="sidebar-desktop">
        <Sidebar active={tab} onNav={setTab} total={headerStats.total} count={headerStats.count} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <header className="top-header" style={{
          padding: "18px 28px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 20, letterSpacing: "-.02em", lineHeight: 1,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {page.title}
            </h1>
            <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{page.sub}</p>
          </div>

          <div className="header-dots" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {NAV_ITEMS.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                padding: "5px 12px", borderRadius: "var(--r-full)",
                background: tab === n.id ? "var(--accent-bg)" : "transparent",
                border: `1px solid ${tab === n.id ? "rgba(110,231,183,0.3)" : "transparent"}`,
                color: tab === n.id ? "var(--accent)" : "var(--text3)",
                fontSize: 12, fontWeight: tab === n.id ? 600 : 400,
                transition: "all .18s",
              }}>
                {n.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{
              padding: "6px 12px", borderRadius: "var(--r-full)",
              background: "var(--surface)", border: "1px solid var(--border2)",
              fontSize: 11, color: "var(--text2)",
              fontFamily: "var(--font-mono)", letterSpacing: ".04em",
            }}>
              {new Date().toLocaleString("en-IN", { month: "short", year: "numeric" })}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="page-body" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {tab === "overview" && <Dashboard refresh={refresh} api={api} />}
          {tab === "add"      && <ChatEntry onExpenseAdded={bump} api={api} />}
          {tab === "insights" && <Insights  refresh={refresh} api={api} />}
          {tab === "history"  && <History   refresh={refresh} onDelete={bump} api={api} />}
        </main>
      </div>

      <nav className="bottom-nav" style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: "var(--bottom-nav-h)",
        background: "var(--bg2)",
        borderTop: "1px solid var(--border2)",
        zIndex: 100, alignItems: "center", justifyContent: "space-around",
        padding: "0 8px", backdropFilter: "blur(20px)",
      }}>
        {NAV_ITEMS.map((n) => {
          const isActive = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "8px 16px", borderRadius: "var(--r-lg)",
              background: isActive ? "var(--accent-bg)" : "transparent",
              border: `1px solid ${isActive ? "rgba(110,231,183,0.2)" : "transparent"}`,
              color: isActive ? "var(--accent)" : "var(--text3)",
              transition: "all .2s", minWidth: 60,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: ".03em" }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}