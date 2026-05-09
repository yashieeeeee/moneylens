import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", gap: 32,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "var(--r-xl)",
          background: "var(--accent-bg)", border: "1px solid rgba(110,231,183,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 16px",
        }}>🪙</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800,
          letterSpacing: "-.03em", color: "var(--text)",
        }}>MoneyLens</h1>
        <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 6 }}>
          Sign in to track your expenses
        </p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#6EE7B7",
            colorBackground: "#171C27",
            colorText: "#ECF0F8",
            colorTextSecondary: "#8B93A8",
            colorInputBackground: "#0D1017",
            colorInputText: "#ECF0F8",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
}