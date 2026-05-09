import { monthLabel, currentMonth, fmt } from "../config";

const NAV = [
  { id: "overview", icon: "◈",  label: "Overview",    desc: "Dashboard" },
  { id: "add",      icon: "＋", label: "Add Expense", desc: "Natural language" },
  { id: "insights", icon: "✦",  label: "AI Insights", desc: "Groq analysis" },
  { id: "history",  icon: "≡",  label: "History",     desc: "All transactions" },
];

export default function Sidebar({ active, onNav, total, count }) {
  const month = currentMonth();

  return (
    <aside style={{
      width: "var(--sidebar-w)", height: "100vh",
      background: "var(--bg2)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, position: "relative", zIndex: 10,
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -60, left: -60, width: 200, height: 200,
        background: "radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ padding: "28px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--r-lg)",
            background: "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(110,231,183,0.05))",
            border: "1px solid rgba(110,231,183,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
            boxShadow: "0 0 20px rgba(110,231,183,0.08)",
          }}>🪙</div>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 18, letterSpacing: "-.03em", color: "var(--text)",
            }}>MoneyLens</div>
            <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".06em", textTransform: "uppercase" }}>
              {monthLabel(month)}
            </div>
          </div>
        </div>
      </div>

      {/* Month spending card */}
      <div style={{
        margin: "0 14px 22px",
        background: "linear-gradient(135deg, rgba(110,231,183,0.06) 0%, rgba(110,231,183,0.02) 100%)",
        border: "1px solid rgba(110,231,183,0.12)",
        borderRadius: "var(--r-xl)", padding: "18px 16px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -30, right: -30, width: 100, height: 100,
          background: "radial-gradient(circle, rgba(110,231,183,0.1) 0%, transparent 70%)",
        }} />
        <div style={{
          fontSize: 10, color: "var(--accent-dim)", textTransform: "uppercase",
          letterSpacing: ".12em", marginBottom: 10, fontWeight: 600,
        }}>
          Month total
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 500,
          color: "var(--accent)", lineHeight: 1, letterSpacing: "-.02em",
        }}>
          {total != null ? "₹" + Math.round(total).toLocaleString("en-IN") : "—"}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 11, color: "var(--text3)", marginTop: 8,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%", background: "var(--accent)",
            animation: "glow-pulse 2s infinite",
          }} />
          {count ?? 0} transactions
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "11px 13px", borderRadius: "var(--r-lg)",
                background: isActive ? "var(--accent-bg)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text2)",
                border: `1px solid ${isActive ? "rgba(110,231,183,0.18)" : "transparent"}`,
                textAlign: "left", width: "100%",
                transition: "all .16s",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text)"; }}}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}}
            >
              <span style={{
                width: 32, height: 32, borderRadius: "var(--r-md)", flexShrink: 0,
                background: isActive ? "rgba(110,231,183,0.12)" : "var(--surface)",
                border: `1px solid ${isActive ? "rgba(110,231,183,0.2)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all .16s",
              }}>
                {item.icon}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, lineHeight: 1.2 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: isActive ? "rgba(110,231,183,0.5)" : "var(--text3)", marginTop: 1 }}>{item.desc}</div>
              </div>
              {isActive && (
                <div style={{
                  marginLeft: "auto", width: 4, height: 4, borderRadius: "50%",
                  background: "var(--accent)", flexShrink: 0,
                  boxShadow: "0 0 8px var(--accent)",
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
            boxShadow: "0 0 6px var(--accent)", flexShrink: 0,
          }} />
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".03em" }}>
            Groq · LLaMA 3.3 70B
          </div>
        </div>
      </div>
    </aside>
  );
}