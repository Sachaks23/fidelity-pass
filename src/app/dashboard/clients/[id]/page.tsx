"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { segmentConfig, type Segment } from "@/lib/segmentation";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
}

interface Transaction {
  id: string;
  type: string;
  pointsDelta: number;
  amount: number | null;
  note: string | null;
  createdAt: string;
}

interface ClientData {
  id: string;
  serialNumber: string;
  points: number;
  totalPointsEarned: number;
  issuedAt: string;
  lastScanDate: string | null;
  segment: Segment;
  totalSpent: number;
  avgFrequencyDays: number | null;
  customer: {
    firstName: string;
    lastName: string;
    phone: string | null;
    user: { email: string; createdAt: string };
  };
  transactions: Transaction[];
  rewards: Reward[];
  _count: { scanEvents: number; transactions: number };
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function loadClient() {
    const data = await fetch(`/api/customers/${id}`).then((r) => r.json());
    setClient(data);
    setLoading(false);
  }

  useEffect(() => { loadClient(); }, [id]);

  async function handleRedeem(rewardId: string) {
    if (!client) return;
    setRedeemingId(rewardId);
    setRedeemMsg(null);
    const res = await fetch("/api/cards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: client.id, rewardId }),
    });
    const data = await res.json();
    if (res.ok) {
      setRedeemMsg({ type: "ok", text: `Récompense « ${data.rewardName} » validée — ${data.newPoints} pts restants` });
      await loadClient();
    } else {
      setRedeemMsg({ type: "err", text: data.error || "Erreur lors de la validation" });
    }
    setRedeemingId(null);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function formatRelative(date: string | null) {
    if (!date) return "—";
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff} jours`;
    return formatDate(date);
  }

  function txLabel(tx: Transaction): { label: string; color: string; sign: string } {
    if (tx.type === "REDEMPTION") return { label: "Récompense utilisée", color: "#ef4444", sign: "−" };
    if (tx.type === "POINTS") return { label: "Achat", color: "#34d399", sign: "+" };
    return { label: tx.type, color: "var(--text-muted)", sign: "" };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Client introuvable.</p>
        <Link href="/dashboard/clients" className="text-xs mt-2 block" style={{ color: "#f59e0b" }}>← Retour</Link>
      </div>
    );
  }

  const seg = segmentConfig[client.segment];
  const redeemableRewards = client.rewards.filter((r) => r.pointsRequired <= client.points);
  const nextReward = client.rewards.find((r) => r.pointsRequired > client.points);

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-xs mb-5 transition-opacity hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
          <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour aux clients
      </Link>

      {/* Header card */}
      <div className="rounded-xl p-5 mb-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center text-black text-xl font-bold flex-shrink-0">
              {client.customer.firstName[0]}{client.customer.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-semibold text-white">
                  {client.customer.firstName} {client.customer.lastName}
                </h1>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: seg.bg, color: seg.color, border: `1px solid ${seg.border}` }}
                >
                  {seg.label}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{client.customer.user.email}</p>
              {client.customer.phone && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{client.customer.phone}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{client.points}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>points disponibles</p>
          </div>
        </div>
      </div>

      {/* Message récompense */}
      {redeemMsg && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm font-medium flex items-center justify-between"
          style={{
            background: redeemMsg.type === "ok" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${redeemMsg.type === "ok" ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
            color: redeemMsg.type === "ok" ? "#34d399" : "#ef4444",
          }}
        >
          <span>{redeemMsg.text}</span>
          <button onClick={() => setRedeemMsg(null)} className="ml-3 opacity-60 hover:opacity-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne gauche */}
        <div className="lg:col-span-1 space-y-4">

          {/* Stats */}
          <div className="rounded-xl p-4 space-y-0" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Statistiques
            </p>
            {[
              { label: "Visites totales", value: String(client._count.scanEvents) },
              { label: "Points cumulés", value: `${client.totalPointsEarned} pts`, highlight: true },
              { label: "Dépenses estimées", value: `${client.totalSpent.toFixed(0)} €` },
              { label: "Fréquence moy.", value: client.avgFrequencyDays ? `${client.avgFrequencyDays} jours` : "—" },
              { label: "Dernière visite", value: formatRelative(client.lastScanDate) },
              { label: "Inscrit le", value: new Date(client.issuedAt).toLocaleDateString("fr-FR") },
            ].map(({ label, value, highlight }, i, arr) => (
              <div
                key={label}
                className="flex justify-between items-center py-2.5"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: highlight ? "#f59e0b" : "white" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Code de parrainage */}
          <div className="rounded-xl p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Code de parrainage</p>
            <p className="text-xs mb-2.5" style={{ color: "var(--text-secondary)" }}>
              À partager pour que ses amis s&apos;inscrivent et reçoivent des points bonus
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(client.serialNumber).catch(() => {})}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              title="Copier le code"
            >
              <p className="text-xs font-mono flex-1 text-left truncate" style={{ color: "#60a5fa" }}>
                {client.serialNumber.slice(0, 16)}...
              </p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Progression */}
          {client.rewards.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Progression
              </p>
              {nextReward ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-medium text-white">{nextReward.name}</p>
                    <p className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
                      {client.points}/{nextReward.pointsRequired}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (client.points / nextReward.pointsRequired) * 100)}%`,
                        background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                    Encore {nextReward.pointsRequired - client.points} pts avant la récompense
                  </p>
                </>
              ) : (
                <p className="text-xs" style={{ color: "#34d399" }}>Toutes les récompenses débloquées</p>
              )}
            </div>
          )}

          {/* Récompenses disponibles */}
          {redeemableRewards.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "var(--surface-1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#34d399" }}>
                Récompenses disponibles
              </p>
              <div className="space-y-2.5">
                {redeemableRewards.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white leading-tight">{r.name}</p>
                      <p className="text-xs" style={{ color: "#f59e0b" }}>{r.pointsRequired} pts</p>
                    </div>
                    <button
                      onClick={() => handleRedeem(r.id)}
                      disabled={redeemingId !== null}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                      style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
                    >
                      {redeemingId === r.id ? "..." : "Utiliser"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : historique */}
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-5 py-3" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Historique des transactions
              </p>
            </div>
            <div style={{ background: "var(--surface-1)" }}>
              {client.transactions.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune transaction pour ce client</p>
                </div>
              ) : (
                client.transactions.map((tx, i) => {
                  const { label, color, sign } = txLabel(tx);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: i < client.transactions.length - 1 ? "1px solid var(--border)" : "none" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: tx.type === "REDEMPTION" ? "rgba(239,68,68,0.1)" : "rgba(52,211,153,0.1)" }}
                        >
                          {tx.type === "REDEMPTION" ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-3.5 h-3.5">
                              <path d="M20 12V22H4V12" strokeLinecap="round" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2} className="w-3.5 h-3.5">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white">{label}</p>
                          {tx.note && (
                            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{tx.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-semibold" style={{ color }}>
                          {sign}{Math.abs(tx.pointsDelta)} pts
                        </p>
                        {tx.amount && (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{tx.amount.toFixed(2)} €</p>
                        )}
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
