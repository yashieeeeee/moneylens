import { useEffect, useState } from "react";
import { fmt, fmtDate, CATEGORIES, currentMonth } from "../config";
export default function History({ refresh, onDelete,api }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const month = currentMonth();

  useEffect(() => {
    setLoading(true);
    api.getExpenses(month).then((d) => {
      setExpenses(d.expenses || []);
      setLoading(false);
    });
  }, [refresh]);

  async function handleDelete(id) {
    setDeletingId(id);
    await api.deleteExpense(id);
    setExpenses((e) => e.filter((x) => x.id !== id));
    setDeletingId(null);
    onDelete?.();
  }

  const cats = ["All", ...Object.keys(CATEGORIES)];
  const filtered = expenses
    .filter((e) => filterCat === "All" || e.category === filterCat)
    .filter((e) =>
      !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.merchant || "").toLowerCase().includes(search.toLowerCase())
    );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Toolbar */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)", padding: "14px 16px",
        display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "var(--text3)", fontSize: 13, pointerEvents: "none",
          }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            style={{
              width: "100%", padding: "9px 12px 9px 34px",
              borderRadius: "var(--r-lg)", border: "1px solid var(--border)",
              background: "var(--bg3)", color: "var(--text)", fontSize: 13, outline: "none",
              transition: "border-color .2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(110,231,183,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {cats.map((cat) => {
            const isActive = filterCat === cat;
            const m = CATEGORIES[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                style={{
                  padding: "5px 11px", borderRadius: "var(--r-full)", fontSize: 11, fontWeight: isActive ? 600 : 400,
                  border: `1px solid ${isActive ? (m?.cssColor + "50" || "rgba(110,231,183,0.3)") : "var(--border)"}`,
                  background: isActive ? (m ? m.bg : "var(--accent-bg)") : "transparent",
                  color: isActive ? (m?.color || "var(--accent)") : "var(--text3)",
                  transition: "all .15s", whiteSpace: "nowrap",
                }}
              >
                {m ? m.icon + " " : ""}{cat}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500 }}>{fmt(total)}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".03em" }}>{filtered.length} txns</div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)", overflow: "hidden",
      }}>
        {/* Table header */}
        <div className="history-table-header" style={{
          display: "grid", gridTemplateColumns: "1fr 120px 90px 36px",
          padding: "10px 18px",
          borderBottom: "1px solid var(--border)",
          fontSize: 9, color: "var(--text3)", textTransform: "uppercase",
          letterSpacing: ".1em", fontWeight: 700, fontFamily: "var(--font-display)",
        }}>
          <span>Transaction</span>
          <span>Category</span>
          <span style={{ textAlign: "right" }}>Amount</span>
          <span />
        </div>

        {loading ? (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
            <div style={{ color: "var(--text3)", fontSize: 13 }}>
              {search || filterCat !== "All" ? "No matching transactions" : "No expenses this month"}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((e, i) => {
              const m = CATEGORIES[e.category] || CATEGORIES.Other;
              const isDeleting = deletingId === e.id;
              return (
                <div
                  key={e.id}
                  className="history-row fade-in"
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 120px 90px 36px",
                    alignItems: "center", padding: "12px 18px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    opacity: isDeleting ? 0.3 : 1,
                    transition: "opacity .2s, background .15s",
                    animationDelay: `${Math.min(i, 10) * 25}ms`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Description */}
                  <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--r-lg)",
                      background: m.bg, border: `1px solid ${m.cssColor}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {m.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {e.description}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2, display: "flex", gap: 8 }}>
                        {e.merchant && <span>{e.merchant}</span>}
                        <span>{fmtDate(e.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category pill */}
                  <div className="history-category-col">
                    <span style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: "var(--r-full)",
                      background: m.bg, color: m.color,
                      border: `1px solid ${m.cssColor}25`, fontWeight: 500,
                    }}>
                      {e.category}
                    </span>
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500,
                    textAlign: "right", color: "var(--text)",
                  }}>
                    {fmt(e.amount)}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={isDeleting}
                    style={{
                      color: "var(--text3)", fontSize: 13, padding: 5,
                      borderRadius: "var(--r-md)", transition: "all .15s",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "var(--red-bg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}