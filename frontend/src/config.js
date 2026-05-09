export const CATEGORIES = {
  Food:          { color: "var(--amber)",  bg: "var(--amber-bg)",  icon: "🍕", cssColor: "#FBBF24" },
  Transport:     { color: "var(--blue)",   bg: "var(--blue-bg)",   icon: "🚗", cssColor: "#60A5FA" },
  Subscriptions: { color: "var(--purple)", bg: "var(--purple-bg)", icon: "📱", cssColor: "#A78BFA" },
  Shopping:      { color: "var(--pink)",   bg: "var(--pink-bg)",   icon: "🛍️", cssColor: "#F472B6" },
  Entertainment: { color: "var(--teal)",   bg: "var(--teal-bg)",   icon: "🎬", cssColor: "#2DD4BF" },
  Health:        { color: "var(--red)",    bg: "var(--red-bg)",    icon: "💊", cssColor: "#FF5C5C" },
  Other:         { color: "var(--text2)",  bg: "rgba(168,168,184,0.1)", icon: "📦", cssColor: "#A8A8B8" },
};

export const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
};
