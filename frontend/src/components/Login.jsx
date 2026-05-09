import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login(email, password)
        : await api.signup(email, password, name);
      localStorage.setItem("ml_token", data.token);
      localStorage.setItem("ml_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border2)",
    background: "var(--bg3)", color: "var(--text)",
    fontSize: 14, outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-2xl)", padding: 32,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "var(--r-xl)",
            background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 14px",
          }}>🪙</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 24,
            fontWeight: 800, letterSpacing: "-.03em",
          }}>MoneyLens</h1>
          <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "var(--bg3)",
          borderRadius: "var(--r-lg)", padding: 4, marginBottom: 22,
        }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "8px", borderRadius: "var(--r-md)", fontSize: 13,
              fontWeight: mode === m ? 600 : 400,
              background: mode === m ? "var(--surface2)" : "transparent",
              color: mode === m ? "var(--text)" : "var(--text3)",
              border: mode === m ? "1px solid var(--border2)" : "1px solid transparent",
              transition: "all .15s",
            }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "var(--r-md)", fontSize: 12, color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            width: "100%", marginTop: 18, padding: "13px",
            borderRadius: "var(--r-lg)", fontSize: 14, fontWeight: 700,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            color: "#000", border: "none",
            opacity: loading || !email || !password ? 0.5 : 1,
            transition: "opacity .2s",
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}