"use client";

import { useEffect, useState } from "react";

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
      className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {style.label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: accent ? `${accent}18` : "var(--surface-3)",
            color: accent ?? "var(--text-secondary)",
          }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white leading-none">{value}</p>
      {sub && (
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm" style={{ color: "#ef4444" }}>
          Erreur : {error}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, clients } = data;
  const proClients = clients.filter((c) => c.plan === "PRO");
  const starterClients = clients.filter((c) => c.plan !== "PRO");

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Vue globale — {stats.totalUsers} professionnel{stats.totalUsers !== 1 ? "s" : ""} inscrits
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="MRR"
          value={`${stats.mrr} €`}
          sub={`${stats.totalPro} abonnements Pro`}
          accent="#f59e0b"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
            </svg>
          }
        />
        <KpiCard
          label="Clients Pro actifs"
          value={stats.totalPro}
          sub="plan Pro"
          accent="#34d399"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
            </svg>
          }
        />
        <KpiCard
          label="Clients Starter"
          value={stats.totalStarter}
          sub="plan Starter"
          accent="#60a5fa"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <circle cx="9" cy="7" r="4" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
          }
        />
        <KpiCard
          label="Total inscrits"
          value={stats.totalUsers}
          sub={`+${stats.newThisWeek} cette semaine`}
          accent="#a78bfa"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {/* Pro clients table */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Clients Pro
            <span
              className="ml-2 text-xs font-semibold px-2 py-0.5 rounded"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              {proClients.length}
            </span>
          </h2>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface-1)" }}
        >
          {proClients.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Aucun client Pro
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {[
                      "Commerce",
                      "Email",
                      "Plan",
                      "Statut",
                      "Clients fidélité",
                      "Inscription",
                      "Prochaine échéance",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
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
                          borderBottom: i < proClients.length - 1 ? "1px solid var(--border)" : "none",
                          background: isPastDue ? "rgba(239,68,68,0.04)" : undefined,
                        }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">
                              {client.business?.name ?? client.name ?? "—"}
                            </p>
                            {client.business?.slug && (
                              <p style={{ color: "var(--text-muted)" }}>
                                /{client.business.slug}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          {client.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="font-semibold px-2 py-0.5 rounded"
                            style={{
                              background: "rgba(245,158,11,0.12)",
                              color: "#f59e0b",
                              border: "1px solid rgba(245,158,11,0.25)",
                            }}
                          >
                            {client.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={client.subscriptionStatus} />
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-white">
                          {client.clientCount}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>
                          {formatDate(client.createdAt)}
                        </td>
                        <td className="px-4 py-3" style={{ color: isPastDue ? "#ef4444" : "var(--text-secondary)" }}>
                          {formatPeriodEnd(client.stripe?.currentPeriodEnd ?? null)}
                        </td>
                        <td className="px-4 py-3">
                          {client.stripeCustomerId ? (
                            <a
                              href={`https://dashboard.stripe.com/customers/${client.stripeCustomerId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-75"
                              style={{
                                background: "rgba(99,91,255,0.12)",
                                color: "#818cf8",
                                border: "1px solid rgba(99,91,255,0.25)",
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3 h-3">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" />
                              </svg>
                              Stripe
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Clients Starter
            <span
              className="ml-2 text-xs font-semibold px-2 py-0.5 rounded"
              style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}
            >
              {starterClients.length}
            </span>
          </h2>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border)", background: "var(--surface-1)" }}
        >
          {starterClients.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Aucun client Starter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Commerce", "Email", "Clients", "Inscrit le"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
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
                        borderBottom: i < starterClients.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">
                            {client.business?.name ?? client.name ?? "—"}
                          </p>
                          {client.business?.slug && (
                            <p style={{ color: "var(--text-muted)" }}>
                              /{client.business.slug}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {client.email}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-white">
                        {client.clientCount}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>
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
    </div>
  );
}
