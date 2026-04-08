"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Range = "7d" | "30d" | "6m" | "1y";

const rangeLabels: Record<Range, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "6m": "6 mois",
  "1y": "1 an",
};

interface Analytics {
  totalCustomers: number;
  activeCards: number;
  totalScansToday: number;
  newCustomers: Array<{ date: string; count: number }>;
  scansPerDay: Array<{ date: string; count: number }>;
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-4xl font-bold text-white">{value}</p>
      {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

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
    if (range === "1y" || range === "6m") {
      return d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  // Sample chart data if sparse
  const chartData = analytics?.newCustomers.map((d) => ({
    ...d,
    label: formatDate(d.date),
  })) || [];

  const scanData = analytics?.scansPerDay.map((d) => ({
    ...d,
    label: formatDate(d.date),
  })) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          {business && (
            <p className="text-slate-400 mt-1">{business.name} · {business.category}</p>
          )}
        </div>
        <div className="flex gap-2">
          {(Object.keys(rangeLabels) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                range === r
                  ? "gold-gradient text-black"
                  : "border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard icon="👥" label="Clients inscrits" value={analytics?.totalCustomers ?? "—"} sub="cartes de fidélité actives" />
        <StatCard icon="✅" label="Cartes actives" value={analytics?.activeCards ?? "—"} />
        <StatCard icon="📷" label="Scans aujourd'hui" value={analytics?.totalScansToday ?? "—"} sub="passages en caisse" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-white font-semibold mb-6">Nouvelles inscriptions</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-500">Chargement...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={false} name="Inscriptions" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-white font-semibold mb-6">Scans par jour</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-500">Chargement...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Scans" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick QR */}
      {business && (
        <div className="mt-6 p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📲</div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">QR Code d&apos;inscription</h3>
              <p className="text-slate-400 text-sm mt-1">
                Partagez ce QR code pour que vos clients s&apos;inscrivent à votre programme de fidélité
              </p>
            </div>
            <a
              href="/api/business/qr"
              download="qr-inscription.png"
              className="px-5 py-2 rounded-lg gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Télécharger le QR →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
