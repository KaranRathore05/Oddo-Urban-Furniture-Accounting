"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 24, height: 24 }} />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.25rem",
        color: "var(--text-secondary)",
        borderRadius: "50%",
        transition: "background 0.2s",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onMouseOver={(e) =>
        (e.currentTarget.style.background = "var(--bg-hover)")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
