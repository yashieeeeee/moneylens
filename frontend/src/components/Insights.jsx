import { api } from "../api"; 
import { useEffect, useState } from "react";

import { fmt, currentMonth, monthLabel } from "../config";

const TYPE = {
  warning: { border: "rgba(252,211,77,0.2)",  bg: "rgba(252,211,77,0.05)",  icon: "⚠️", label: "Heads up",   labelColor: "var(--amber)" },
  success: { border: "rgba(110,231,183,0.2)", bg: "rgba(110,231,183,0.05)", icon: "✅", label: "Good habit",  labelColor: "var(--green)" },
  info:    { border: "rgba(125,211,252,0.2)", bg: "rgba(125,211,252,0.05)", icon: "💡", label: "Tip",         labelColor: "var(--blue)" },
};

function InsightCard({ insight, delay }) {
  const s = TYPE[insight.type] || TYPE.info;
  return (
    <div className="fade-up" style={{
      animationDelay: `${delay}ms`,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "var(--r-xl)", padding: "18px 20px",
      transition: "transform .2s, border-color .2s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = s.border.replace("0.2", "0.4"); }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = s.border; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "var(--r-md)",
            background: s.bg, border: `1px solid ${s.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
          }}>
            {s.icon}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)", letterSpacing: "-.01em" }}>
            {insight.title}
          </div>
        </div>
        <div style={{
          fontSize: 9, padding: "3px 9px", borderRadius: "var(--r-full)",
          border: `1px solid ${s.border}`, color: s.labelColor,
          flexShrink: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
          background: s.bg,
        }}>
          {s.label}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.75, paddingLeft: 44 }}>
        {insight.message}
      </p>
      {insight.savings && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, marginLeft: 44,
          padding: "5px 12px",
          background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.2)",
          borderRadius: "var(--r-full)", fontSize: 11, color: "var(--green)", fontWeight: 600,
          letterSpacing: ".03em",
        }}>
          🐷 Save {fmt(insight.savings)}/mo
        </div>
      )}
    </div>
  );
}

export default function Insights({ refresh }) {
  const [insights, setInsights] = useState([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const month = currentMonth();

  async function load() {
    setLoading(true);
    try {
      const data = await api.getInsights(month);
      setInsights(data.insights || []);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Unknown error";
      const isNetworkDown = !err?.response && (msg.includes("Network") || msg.includes("fetch") || msg.includes("ECONNREFUSED"));
      setInsights([{
        title: isNetworkDown ? "Backend not running" : "Could not load insights",
        message: isNetworkDown
          ? "Start the backend with npm run dev, then refresh."
          : `Error: ${msg}`,
        type: "info",
      }]);
    }
    setLoading(false);
  }

  async function loadReport() {
    setReportLoading(true);
    setShowReport(true);
    try {
      const data = await api.getReport(month);
      setReport(data.report || "No report available.");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Unknown error";
      setReport(`Error generating report: ${msg}`);
    }
    setReportLoading(false);
  }

  useEffect(() => { load(); }, [refresh]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)", padding: "16px 20px",
        gap: 12, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>
            AI Insights
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
            {monthLabel(month)} · Groq analysis
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={loadReport}
            style={{
              padding: "9px 14px", borderRadius: "var(--r-lg)",
              border: "1px solid var(--border2)", background: "var(--bg3)",
              color: "var(--text2)", fontSize: 12, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6, transition: "all .18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(252,211,77,0.3)"; e.currentTarget.style.color = "var(--amber)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}
          >
            📄 Monthly Report
          </button>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: "9px 14px", borderRadius: "var(--r-lg)",
              background: loading ? "var(--surface2)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: loading ? "var(--text3)" : "#000",
              fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
              transition: "all .2s", border: "none",
            }}
          >
            {loading ? "Analyzing…" : "🔄 Re-analyze"}
          </button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, animationDelay: `${i * 80}ms` }} />
          ))}
          <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 12, paddingTop: 4 }}>
            🤖 Groq is analyzing your spending patterns…
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((ins, i) => <InsightCard key={i} insight={ins} delay={i * 60} />)}
        </div>
      )}

      {/* Monthly report */}
      {showReport && (
        <div className="fade-up" style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>📊 Monthly Report</div>
            <button
              onClick={() => setShowReport(false)}
              style={{
                color: "var(--text3)", fontSize: 16, lineHeight: 1,
                width: 28, height: 28, borderRadius: "var(--r-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text3)"; }}
            >✕</button>
          </div>
          {reportLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 18 }} />)}
              <div style={{ color: "var(--text3)", fontSize: 12, textAlign: "center", paddingTop: 6 }}>
                Generating your report with Groq…
              </div>
            </div>
          ) : (
            <pre style={{
              fontSize: 13, lineHeight: 1.9, color: "var(--text2)",
              whiteSpace: "pre-wrap", fontFamily: "var(--font-body)",
              borderTop: "1px solid var(--border)", paddingTop: 14,
            }}>
              {report}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}