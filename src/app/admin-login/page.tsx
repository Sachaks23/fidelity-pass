"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (res.ok) {
        router.push("/admin-dashboard");
      } else {
        setError("Identifiants incorrects");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Subtle label */}
      <p
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "#475569",
          textTransform: "uppercase",
        }}
      >
        Administration
      </p>

      {/* Login card */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "2rem",
          background: "#1e293b",
          borderRadius: "0.75rem",
          border: "1px solid #334155",
        }}
      >
        <h1
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#f1f5f9",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          Connexion
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label
              htmlFor="email"
              style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.625rem 0.75rem",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                color: "#f1f5f9",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label
              htmlFor="password"
              style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.625rem 0.75rem",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                color: "#f1f5f9",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Remember me */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: "14px", height: "14px", accentColor: "#3b82f6", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Rester connecté 30 jours</span>
          </label>

          {error && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#f87171",
                textAlign: "center",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.25rem",
              padding: "0.625rem",
              background: loading ? "#334155" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "..." : "Accéder"}
          </button>
        </form>
      </div>
    </div>
  );
}
