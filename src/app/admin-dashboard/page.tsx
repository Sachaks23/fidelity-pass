"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StripeInfo {
  currentPeriodEnd: number | null;
  nextInvoiceAmount: number | null;
  latestInvoiceStatus: string | null;
  isPastDue: boolean;
}

interface ClientData {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  createdAt: string;
  business: { name: string; slug: string } | null;
  clientCount: number;
  stripe: StripeInfo | null;
}

interface StatsData {
  totalPro: number;
  totalStarter: number;
  totalUsers: number;
  mrr: number;
  newThisWeek: number;
}

interface ApiResponse {
  stats: StatsData;
  clients: ClientData[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPeriodEnd(timestamp: number | null) {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    active: {
      label: "Actif",
      bg: "rgba(52,211,153,0.12)",
      color: "#34d399",
      border: "rgba(52,211,153,0.25)",
    },
    trialing: {
      label: "Essai",
      bg: "rgba(96,165,250,0.12)",
      color: "#60a5fa",
      border: "rgba(96,165,250,0.25)",
    },
    past_due: {
      label: "Impayé",
      bg: "rgba(239,68,68,0.12)",
      color: "#ef4444",
      border: "rgba(239,68,68,0.25)",
    },
    canceled: {
      label: "Annulé",
      bg: "rgba(148,163,184,0.1)",
      color: "#94a3b8",
      border: "rgba(148,163,184,0.2)",
    },
  };

  const style = map[status] ?? {
    label: "Inactif",
    bg: "rgba(148,163,184,0.1)",
    color: "#94a3b8",
    border: "rgba(148,163,184,0.2)",
  };

  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 600,
        padding: "0.2rem 0.5rem",
        borderRadius: "0.25rem",
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {style.label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "0.75rem",
        padding: "1.25rem",
      }}
    >
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#64748b",
          marginBottom: "0.75rem",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.5rem" }}>{sub}</p>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify auth
    fetch("/api/admin-auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((d: { email: string }) => {
        setAdminEmail(d.email);
        // Fetch stats
        return fetch("/api/admin/stats");
      })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ApiResponse) => setData(d))
      .catch((e: Error) => {
        if (e.message === "unauthorized") {
          router.push("/admin-login");
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin-auth/logout", { method: "POST" });
    router.push("/admin-login");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "1.5rem",
            height: "1.5rem",
            border: "2px solid #3b82f6",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>
          Erreur : {error ?? "Données indisponibles"}
        </p>
      </div>
    );
  }

  const { stats, clients } = data;
  const proClients = clients.filter((c) => c.plan === "PRO");
  const starterClients = clients.filter((c) => c.plan !== "PRO");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "0 1.5rem",
          height: "3.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0f172a",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f1f5f9" }}>
          Fidco Admin
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {adminEmail && (
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{adminEmail}</span>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              padding: "0.375rem 0.75rem",
              background: "transparent",
              border: "1px solid #334155",
              borderRadius: "0.375rem",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ padding: "2rem 1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <KpiCard
            label="MRR"
            value={`${stats.mrr} €`}
            sub={`${stats.totalPro} abonnements Pro`}
          />
          <KpiCard
            label="Clients Pro"
            value={stats.totalPro}
            sub="plan Pro"
          />
          <KpiCard
            label="Clients Starter"
            value={stats.totalStarter}
            sub="plan Starter"
          />
          <KpiCard
            label="Total inscrits"
            value={stats.totalUsers}
            sub={`+${stats.newThisWeek} cette semaine`}
          />
        </div>

        {/* Pro clients table */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#94a3b8",
              marginBottom: "0.75rem",
            }}
          >
            Clients Pro{" "}
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "0.25rem",
                background: "rgba(245,158,11,0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.25)",
                marginLeft: "0.5rem",
              }}
            >
              {proClients.length}
            </span>
          </h2>

          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.75rem",
              overflow: "hidden",
            }}
          >
            {proClients.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Aucun client Pro</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #334155" }}>
                      {["Commerce", "Email", "Plan", "Statut Stripe", "Clients fidélité", "Inscrit le", "Prochaine échéance", "Lien Stripe"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proClients.map((client, i) => {
                      const isPastDue = client.stripe?.isPastDue ?? false;
                      return (
                        <tr
                          key={client.id}
                          style={{
                            borderBottom: i < proClients.length - 1 ? "1px solid #1e293b" : "none",
                            background: isPastDue ? "rgba(239,68,68,0.04)" : undefined,
                          }}
                        >
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <p style={{ fontWeight: 500, color: "#f1f5f9", margin: 0 }}>
                              {client.business?.name ?? client.name ?? "—"}
                            </p>
                            {client.business?.slug && (
                              <p style={{ color: "#64748b", margin: 0, fontSize: "0.7rem" }}>
                                /{client.business.slug}
                              </p>
                            )}
                          </td>
                          <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>{client.email}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                padding: "0.2rem 0.5rem",
                                borderRadius: "0.25rem",
                                background: "rgba(245,158,11,0.12)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.25)",
                              }}
                            >
                              {client.plan}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <StatusBadge status={client.subscriptionStatus} />
                          </td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600, color: "#f1f5f9" }}>
                            {client.clientCount}
                          </td>
                          <td style={{ padding: "0.75rem 1rem", color: "#64748b", whiteSpace: "nowrap" }}>
                            {formatDate(client.createdAt)}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 1rem",
                              color: isPastDue ? "#ef4444" : "#94a3b8",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatPeriodEnd(client.stripe?.currentPeriodEnd ?? null)}
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            {client.stripeCustomerId ? (
                              <a
                                href={`https://dashboard.stripe.com/customers/${client.stripeCustomerId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "0.375rem",
                                  background: "rgba(99,91,255,0.12)",
                                  color: "#818cf8",
                                  border: "1px solid rgba(99,91,255,0.25)",
                                  textDecoration: "none",
                                }}
                              >
                                Stripe ↗
                              </a>
                            ) : (
                              <span style={{ color: "#475569" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Starter clients table */}
        <section>
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#94a3b8",
              marginBottom: "0.75rem",
            }}
          >
            Clients Starter{" "}
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "0.25rem",
                background: "rgba(96,165,250,0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.2)",
                marginLeft: "0.5rem",
              }}
            >
              {starterClients.length}
            </span>
          </h2>

          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.75rem",
              overflow: "hidden",
            }}
          >
            {starterClients.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Aucun client Starter</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #334155" }}>
                      {["Commerce", "Email", "Clients", "Inscrit le"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#64748b",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {starterClients.map((client, i) => (
                      <tr
                        key={client.id}
                        style={{
                          borderBottom: i < starterClients.length - 1 ? "1px solid #1e293b" : "none",
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <p style={{ fontWeight: 500, color: "#f1f5f9", margin: 0 }}>
                            {client.business?.name ?? client.name ?? "—"}
                          </p>
                          {client.business?.slug && (
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.7rem" }}>
                              /{client.business.slug}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>{client.email}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600, color: "#f1f5f9" }}>
                          {client.clientCount}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#64748b", whiteSpace: "nowrap" }}>
                          {formatDate(client.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
