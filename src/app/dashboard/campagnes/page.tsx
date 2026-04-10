"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetCount: number;
  defaultSubject: string;
  defaultMessage: string;
}

function CampaignIcon({ icon }: { icon: string }) {
  if (icon === "clock") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  );
  if (icon === "target") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" rx="1" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

export default function CampagnesPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("STARTER");
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"email" | "push" | "both">("email");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/campaigns").then((r) => r.json()),
      fetch("/api/user/plan").then((r) => r.json()),
    ]).then(([camps, planData]) => {
      setCampaigns(camps);
      setPlan(planData.plan ?? "STARTER");
      setLoading(false);
    });
  }, []);

  function openCampaign(c: Campaign) {
    setSelected(c);
    setSubject(c.defaultSubject);
    setMessage(c.defaultMessage);
    setResult(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSending(true);
    setResult(null);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: selected.id, subject, message, channel }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ type: "ok", text: `Campagne envoyée à ${data.sentCount} client${data.sentCount !== 1 ? "s" : ""}` });
      // Refresh counts
      fetch("/api/campaigns").then((r) => r.json()).then(setCampaigns);
    } else {
      setResult({ type: "err", text: data.error || "Erreur lors de l'envoi" });
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Campagnes</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Envoyez des messages ciblés à vos clients selon leur comportement
        </p>
      </div>

      {plan === "STARTER" && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Fonctionnalité Pro</p>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
            Les campagnes automatiques sont disponibles avec l&apos;abonnement Pro. Touchez vos clients inactifs, ceux proches d&apos;une récompense, et bien plus.
          </p>
          <Link href="/tarifs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black gold-gradient hover:opacity-90 transition-opacity">
            Passer Pro — 7 jours gratuits
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <polyline points="9 18 15 12 9 6" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => plan === "PRO" ? openCampaign(c) : undefined}
            disabled={plan !== "PRO"}
            className="text-left rounded-xl p-4 transition-all group"
            style={{
              background: selected?.id === c.id ? "var(--surface-2)" : "var(--surface-1)",
              border: selected?.id === c.id ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border)",
              opacity: plan !== "PRO" ? 0.5 : 1,
              cursor: plan !== "PRO" ? "not-allowed" : "pointer",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                <CampaignIcon icon={c.icon} />
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: c.targetCount > 0 ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
                  color: c.targetCount > 0 ? "#f59e0b" : "var(--text-muted)",
                }}
              >
                {c.targetCount} client{c.targetCount !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mb-1">{c.name}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.description}</p>
          </button>
        ))}
      </div>

      {/* Formulaire d'envoi */}
      {selected && plan === "PRO" && (
        <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-white">{selected.name}</p>
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {result && (
            <div
              className="rounded-lg px-4 py-3 mb-4 text-sm font-medium"
              style={{
                background: result.type === "ok" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${result.type === "ok" ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                color: result.type === "ok" ? "#34d399" : "#ef4444",
              }}
            >
              {result.text}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            {/* Canal */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Canal d&apos;envoi
              </label>
              <div className="flex gap-2">
                {[
                  { value: "email", label: "Email uniquement" },
                  { value: "push", label: "Push uniquement" },
                  { value: "both", label: "Email + Push" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setChannel(opt.value as any)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: channel === opt.value ? "var(--surface-3)" : "var(--surface-2)",
                      color: channel === opt.value ? "white" : "var(--text-muted)",
                      border: channel === opt.value ? "1px solid rgba(245,158,11,0.2)" : "1px solid var(--border)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sujet */}
            {(channel === "email" || channel === "both") && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Objet de l&apos;email
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Message <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(utilisez {"{{prenom}}"} pour personnaliser)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white transition-colors resize-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {selected.targetCount} destinataire{selected.targetCount !== 1 ? "s" : ""}
              </p>
              <button
                type="submit"
                disabled={sending || selected.targetCount === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-black gold-gradient hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {sending ? "Envoi en cours..." : `Envoyer la campagne`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
