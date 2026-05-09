export default function StatCard({ label, value, sub, accent, delay = 0, icon }) {
  return (
    <div className="fade-up" style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl)",
      padding: "20px",
      animationDelay: `${delay}ms`,
      position: "relative", overflow: "hidden",
      transition: "border-color .2s, transform .2s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}30`; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Top accent line */}
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 20, right: 20, height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
        }} />
      )}
      {/* Subtle glow */}
      {accent && (
        <div style={{
          position: "absolute", top: -40, right: -20, width: 100, height: 100,
          background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          fontSize: 10, color: "var(--text3)", textTransform: "uppercase",
          letterSpacing: ".1em", fontWeight: 600, fontFamily: "var(--font-display)",
        }}>
          {label}
        </div>
        {icon && (
          <div style={{
            width: 28, height: 28, borderRadius: "var(--r-md)",
            background: accent ? `${accent}12` : "var(--surface2)",
            border: `1px solid ${accent ? `${accent}20` : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13,
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500,
        color: accent || "var(--text)", lineHeight: 1,
        animation: "countUp 0.4s ease both",
        animationDelay: `${delay + 80}ms`,
        letterSpacing: "-.02em",
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 7, letterSpacing: ".02em" }}>{sub}</div>
      )}
    </div>
  );
}