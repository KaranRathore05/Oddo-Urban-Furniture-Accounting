"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "var(--bg-primary)",
      }}
    >
      <div
        className="auth-card"
        style={{ maxWidth: "400px", textAlign: "center", padding: "3rem 2rem" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "24px",
            background: "rgba(239, 68, 68, 0.15)",
            color: "var(--danger)",
            marginBottom: "1.5rem",
          }}
        >
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Something went wrong!
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginBottom: "2rem",
          }}
        >
          We encountered an unexpected error while connecting to the database or
          loading this page.
        </p>
        <button
          className="btn btn-primary btn-full"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onClick={() => reset()}
        >
          <RefreshCcw size={16} />
          Try again
        </button>
      </div>
    </div>
  );
}
