"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

type Range = "7d" | "30d" | "6m" | "1y";

const rangeLabels: Record<Range, string> = {
  "7d": "7j",
  "30d": "30j",
  "6m": "6 mois",
  "1y": "1 an",
};

interface Analytics {
  totalCustomers: number;
  activeCards: number;
  totalScansToday: number;
  returnRate: number;
  newCustomers: Array<{ date: string; count: number }>;
  scansPerDay: Array<{ date: string; count: number }>;
  segmentCounts: Record<string, number>;
  topClients: Array<{ id: string; name: string; points: number; totalPointsEarned: number; scanCount: number }>;
  inactiveClients: Array<{ id: string; name: string; points: number; lastScanDate: string | null }>;
  inactiveCount: number;
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "#111d33",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
  },
  cursor: { stroke: "rgba(245,158,11,0.2)", strokeWidth: 1 },
};

const segmentColors: Record<string, string> = {
  nouveau: "#60a5fa",
  régulier: "#34d399",
  vip: "#f59e0b",
  inactif: "#94a3b8",
};

export default function DashboardPage() {
  const [range, setRange] = useState<Range>("30d");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    fetch("/api/business").then((r) => r.json()).then(setBusiness).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [range]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const formatRelative = (date: string | null) => {
    if (!date) return "—";
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 30) return `${diff}j`;
    return `${Math.floor(diff / 30)}m`;
  };

  const chartData = analytics?.newCustomers.map((d) => ({ ...d, label: formatDate(d.date) })) || [];
  const scanData = analytics?.scansPerDay.map((d) => ({ ...d, label: formatDate(d.date) })) || [];

  const totalSegments = analytics
    ? Object.values(analytics.segmentCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {business ? business.name : "Tableau de bord"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {business ? business.category : "Chargement..."}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          {(Object.keys(rangeLabels) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={range === r ? { background: "var(--surface-3)", color: "white" } : { color: "var(--text-muted)" }}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Alerte inactifs */}
      {analytics && analytics.inactiveCount > 0 && (
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-3.5 h-3.5">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                {analytics.inactiveCount} client{analytics.inactiveCount > 1 ? "s" : ""} inactif{analytics.inactiveCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Pas de visite depuis plus de 60 jours
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/clients"
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Voir
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Clients"
          value={analytics?.totalCustomers ?? "—"}
          sub="membres inscrits"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
          }
        />
        <StatCard
          label="Scans aujourd'hui"
          value={analytics?.totalScansToday ?? "—"}
          sub="passages en caisse"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
              <rect x="7" y="7" width="3" height="3" rx="0.5" /><rect x="14" y="7" width="3" height="3" rx="0.5" /><rect x="7" y="14" width="3" height="3" rx="0.5" /><path d="M14 14h3v3h-3z" />
            </svg>
          }
        />
        <StatCard
          label="Taux de retour"
          value={analytics ? `${analytics.returnRate}%` : "—"}
          sub="clients fidélisés"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.95" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Cartes actives"
          value={analytics?.activeCards ?? "—"}
          sub="en circulation"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold text-white mb-5">Nouvelles inscriptions</p>
          {loading ? (
            <div className="h-44 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="#334155" tick={{ fontSize: 10, fill: "#475569" }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis stroke="#334155" tick={{ fontSize: 10, fill: "#475569" }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={false} name="Inscriptions" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold text-white mb-5">Scans par jour</p>
          {loading ? (
            <div className="h-44 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={scanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="#334155" tick={{ fontSize: 10, fill: "#475569" }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis stroke="#334155" tick={{ fontSize: 10, fill: "#475569" }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Scans" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Top clients */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold text-white">Top clients</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (analytics?.topClients.length ?? 0) === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Aucun client</p>
            </div>
          ) : (
            analytics!.topClients.map((c, i) => (
              <Link
                key={c.id}
                href={`/dashboard/clients/${c.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.025] transition-colors"
                style={{ borderBottom: i < analytics!.topClients.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span className="text-xs font-bold w-4 text-center" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.scanCount} visite{c.scanCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: "#f59e0b" }}>{c.totalPointsEarned} pts</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Segmentation */}
        {analytics && totalSegments > 0 && (
          <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold text-white mb-4">Répartition clients</p>
            <div className="space-y-3">
              {Object.entries(analytics.segmentCounts)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([seg, count]) => {
                  const pct = Math.round((count / totalSegments) * 100);
                  const color = segmentColors[seg] || "#94a3b8";
                  const labels: Record<string, string> = { nouveau: "Nouveaux", régulier: "Réguliers", vip: "VIP", inactif: "Inactifs" };
                  return (
                    <div key={seg}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium" style={{ color }}>{labels[seg] || seg}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* QR inscription */}
      {business && (
        <div className="rounded-xl p-5 flex items-center gap-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">QR code d&apos;inscription</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
              Partagez ce code pour que vos clients s&apos;inscrivent à votre programme
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`/rejoindre/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "var(--surface-3)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Voir la page
            </a>
            <a
              href="/api/business/qr"
              download="qr-inscription.png"
              className="px-3 py-2 rounded-lg text-xs font-medium text-black gold-gradient hover:opacity-90 transition-opacity"
            >
              Télécharger
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
