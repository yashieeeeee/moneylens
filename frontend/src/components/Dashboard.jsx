import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { fmt, CATEGORIES, currentMonth } from "../config";
import StatCard from "./StatCard";
ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

function CategoryBar({ category, amount, total, delay }) {
  const m = CATEGORIES[category] || CATEGORIES.Other;
  const pct = Math.round((amount / total) * 100);
  return (
    <div className="fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "var(--r-md)",
            background: m.bg, border: `1px solid ${m.cssColor}20`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>
            {m.icon}
          </div>
          <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{category}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)" }}>{fmt(amount)}</span>
          <span style={{
            fontSize: 10, color: m.color, minWidth: 32, textAlign: "right",
            fontFamily: "var(--font-mono)", fontWeight: 500,
          }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 4, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${m.cssColor}99, ${m.cssColor})`,
          borderRadius: 4,
          boxShadow: `0 0 8px ${m.cssColor}40`,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}

export default function Dashboard({ refresh,api }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const month = currentMonth();

  useEffect(() => {
    setLoading(true);
    api.getStats(month).then(setStats).finally(() => setLoading(false));
  }, [refresh]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 96 }} />)}
        </div>
        <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>
          <div className="skeleton" style={{ height: 240 }} />
          <div className="skeleton" style={{ height: 240 }} />
        </div>
      </div>
    );
  }

  if (!stats || stats.count === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "80px 20px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "var(--r-2xl)",
          background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
        }}>🪙</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>No expenses yet</div>
          <div style={{ color: "var(--text3)", fontSize: 13 }}>
            Add expenses or run <code style={{ color: "var(--accent)", background: "var(--accent-bg)", padding: "1px 6px", borderRadius: 4 }}>npm run seed</code>
          </div>
        </div>
      </div>
    );
  }

  const catData = stats.byCategory;
  const labels = catData.map((c) => c.category);
  const values = catData.map((c) => c.total);
  const cssColors = labels.map((l) => (CATEGORIES[l] || CATEGORIES.Other).cssColor);
  const dayLabels = stats.byDay.map((d) => new Date(d.date).getDate() + "");
  const dayValues = stats.byDay.map((d) => d.total);
  const avgDay = stats.total / Math.max(stats.byDay.length, 1);
  const topCat = catData[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stat cards */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <StatCard label="Total Spent"  value={fmt(stats.total)}     accent="var(--red)"   icon="💸" delay={0} />
        <StatCard label="Transactions" value={stats.count}          sub={`${catData.length} categories`} accent="var(--blue)"  icon="📋" delay={60} />
        <StatCard label="Avg / Day"    value={fmt(avgDay)}          accent="var(--accent)" icon="📅" delay={120} />
      </div>

      {/* Charts row */}
      <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>
        {/* Donut */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "18px 16px",
        }}>
          <div style={{
            fontSize: 10, color: "var(--text3)", textTransform: "uppercase",
            letterSpacing: ".1em", fontWeight: 600, marginBottom: 14,
          }}>By Category</div>
          <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 14px" }}>
            <Doughnut
              data={{ labels, datasets: [{ data: values, backgroundColor: cssColors, borderWidth: 0, hoverOffset: 8 }] }}
              options={{
                cutout: "72%",
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${fmt(c.raw)}` } } },
                animation: { duration: 700 },
              }}
            />
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", pointerEvents: "none",
            }}>
              <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".1em" }}>total</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
                {fmt(stats.total)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {catData.slice(0, 5).map((c) => {
              const m = CATEGORIES[c.category] || CATEGORIES.Other;
              return (
                <div key={c.category} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: m.cssColor, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: "var(--text3)" }}>{c.category}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text2)", fontSize: 10 }}>
                    {Math.round((c.total / stats.total) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "18px 20px",
        }}>
          <div style={{
            fontSize: 10, color: "var(--text3)", textTransform: "uppercase",
            letterSpacing: ".1em", fontWeight: 600, marginBottom: 14,
          }}>Daily Spending</div>
          <Bar
            data={{
              labels: dayLabels,
              datasets: [{
                data: dayValues,
                backgroundColor: "rgba(110,231,183,0.25)",
                hoverBackgroundColor: "rgba(110,231,183,0.7)",
                borderRadius: 6, borderSkipped: false,
                borderColor: "rgba(110,231,183,0.4)", borderWidth: 1,
              }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => " " + fmt(c.raw) } } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10, family: "'JetBrains Mono'" }, color: "#4A5168" }, border: { display: false } },
                y: {
                  grid: { color: "rgba(255,255,255,0.04)" },
                  ticks: { font: { size: 10, family: "'JetBrains Mono'" }, color: "#4A5168", callback: (v) => "₹" + Math.round(v / 1000) + "k" },
                  border: { display: false },
                },
              },
              animation: { duration: 600 },
            }}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)", padding: "20px 22px",
      }}>
        <div style={{
          fontSize: 10, color: "var(--text3)", textTransform: "uppercase",
          letterSpacing: ".1em", fontWeight: 600, marginBottom: 18,
        }}>Spending Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {catData.map((c, i) => (
            <CategoryBar key={c.category} category={c.category} amount={c.total} total={stats.total} delay={i * 50} />
          ))}
        </div>
      </div>

      {/* Top category banner */}
      {topCat && (
        <div className="fade-up" style={{
          background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.15)",
          borderRadius: "var(--r-lg)", padding: "14px 18px",
          display: "flex", alignItems: "center", gap: 12, fontSize: 13,
        }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ color: "var(--text2)", lineHeight: 1.5 }}>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{topCat.category}</span>
            {" "}is your top spend — {fmt(topCat.total)} ({Math.round(topCat.total / stats.total * 100)}% of total).
            {" "}<span style={{ color: "var(--text3)" }}>Check AI Insights for tips.</span>
          </span>
        </div>
      )}
    </div>
  );
}