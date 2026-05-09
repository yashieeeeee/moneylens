import { useState, useRef, useEffect } from "react";
import { fmt, CATEGORIES } from "../config";
import { api } from "../api"; 
const SUGGESTIONS = [
  "Spent 250 on Zomato",
  "Netflix 499",
  "Uber to office 180",
  "Medicines at Apollo 650",
  "Swiggy breakfast 120",
  "Amazon order 1299",
  "PVR tickets 480",
  "Gym membership 1200",
];

const BOT_INTRO = {
  role: "bot",
  text: 'Hey! Tell me what you spent — naturally. Try "Spent 250 on Zomato" or "Netflix 499". I\'ll handle the rest.',
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--accent)",
          animation: `pulse-dot 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const m = msg.expense ? CATEGORIES[msg.expense.category] || CATEGORIES.Other : null;

  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      animation: "fadeUp 0.25s ease both", gap: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0, marginTop: 2,
        }}>🪙</div>
      )}
      <div style={{ maxWidth: "72%" }}>
        <div style={{
          padding: "11px 15px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser
            ? "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(110,231,183,0.08))"
            : "var(--surface2)",
          border: `1px solid ${isUser ? "rgba(110,231,183,0.2)" : "var(--border)"}`,
          fontSize: 13, lineHeight: 1.6,
          color: isUser ? "var(--accent)" : "var(--text)",
        }}>
          {msg.loading ? <TypingDots /> : <span>{msg.text}</span>}
        </div>

        {msg.expense && m && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            marginTop: 8,
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: "var(--r-xl)", padding: "12px 16px",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "var(--r-lg)",
              background: m.bg, border: `1px solid ${m.cssColor}20`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 500, color: m.color, lineHeight: 1 }}>
                {fmt(msg.expense.amount)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                {msg.expense.category} · {msg.expense.merchant || "—"}
              </div>
            </div>
            <div style={{
              marginLeft: 4, padding: "3px 10px",
              background: "var(--green-bg)", border: "1px solid rgba(110,231,183,0.2)",
              borderRadius: "var(--r-full)", fontSize: 10, color: "var(--green)", fontWeight: 600,
              letterSpacing: ".04em",
            }}>
              ✓ saved
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatEntry({ onExpenseAdded,api }) {
  const [msgs, setMsgs] = useState([BOT_INTRO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send(text) {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput("");
    setLoading(true);
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "bot", loading: true }]);

    try {
      const { expense } = await api.parseExpense(t);
      setMsgs((m) => [
        ...m.filter((x) => !x.loading),
        {
          role: "bot",
          text: `Logged! ${fmt(expense.amount)} at ${expense.merchant || expense.description}.`,
          expense,
        },
      ]);
      onExpenseAdded?.();
    } catch (err) {
      const msg = err.message.includes("fetch")
        ? "Backend not running. Start it with: cd backend && npm run dev"
        : `Error: ${err.message}`;
      setMsgs((m) => [...m.filter((x) => !x.loading), { role: "bot", text: msg }]);
    }
    setLoading(false);
  }

  return (
    <div className="chat-layout" style={{ display: "flex", gap: 16, height: "calc(100vh - 120px)" }}>
      {/* Chat panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-2xl)", overflow: "hidden", minWidth: 0,
      }}>
        {/* Chat header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          background: "var(--surface)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🪙</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>MoneyLens AI</div>
            <div style={{ fontSize: 10, color: "var(--accent)", display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
              Groq · LLaMA 3.3 70B
            </div>
          </div>
          <div style={{
            marginLeft: "auto", padding: "4px 10px", borderRadius: "var(--r-full)",
            background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.2)",
            fontSize: 10, color: "var(--accent)", fontWeight: 600, letterSpacing: ".05em",
          }}>
            {msgs.length - 1} messages
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tell me what you spent..."
                disabled={loading}
                style={{
                  width: "100%", padding: "12px 16px",
                  borderRadius: "var(--r-xl)",
                  border: "1px solid var(--border2)",
                  background: "var(--bg3)", color: "var(--text)",
                  fontSize: 14, outline: "none",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(110,231,183,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width: 46, height: 46, borderRadius: "var(--r-lg)", flexShrink: 0,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, var(--accent), var(--accent2))"
                  : "var(--surface2)",
                color: input.trim() && !loading ? "#000" : "var(--text3)",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .2s", border: "1px solid var(--border)",
                fontWeight: 700,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      {/* Quick-add sidebar */}
      <div className="quick-add-panel" style={{ width: 210, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: 16, flex: 1, overflowY: "auto",
        }}>
          <div style={{
            fontSize: 10, color: "var(--text3)", textTransform: "uppercase",
            letterSpacing: ".1em", fontWeight: 600, marginBottom: 12,
          }}>Quick Add</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  padding: "9px 12px", borderRadius: "var(--r-md)",
                  border: "1px solid var(--border)",
                  background: "var(--bg3)", color: "var(--text2)",
                  fontSize: 12, textAlign: "left",
                  transition: "all .15s", lineHeight: 1.3,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(110,231,183,0.3)";
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.background = "var(--accent-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text2)";
                  e.currentTarget.style.background = "var(--bg3)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.15)",
          borderRadius: "var(--r-xl)", padding: "14px 16px",
        }}>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 8, letterSpacing: ".03em" }}>
            💡 Natural language
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.9 }}>
            <span style={{ color: "var(--text2)" }}>Spent 200 on Zomato</span><br />
            <span style={{ color: "var(--text2)" }}>Netflix 499 this month</span><br />
            <span style={{ color: "var(--text2)" }}>Auto to airport 380</span>
          </div>
        </div>
      </div>
    </div>
  );
}