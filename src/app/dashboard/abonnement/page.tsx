"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AbonnementPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => {
        setPlan(d.plan ?? "STARTER");
        setStatus(d.subscriptionStatus ?? null);
        setLoading(false);
      });
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isPro = plan === "PRO" || plan === "BUSINESS";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Abonnement</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Gérez votre formule et vos informations de facturation
        </p>
      </div>

      {/* Plan actuel */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Formule actuelle
          </p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: isPro ? "rgba(245,158,11,0.12)" : "var(--surface-2)", border: isPro ? "1px solid rgba(245,158,11,0.2)" : "1px solid var(--border)" }}
              >
                {isPro ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={1.75} className="w-5 h-5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5" style={{ color: "var(--text-muted)" }}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  {plan === "STARTER" ? "Starter" : plan === "PRO" ? "Fidco Pro" : "Fidco Business"}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {plan === "STARTER"
                    ? "Gratuit — fonctionnalités limitées"
                    : plan === "PRO"
                    ? "90 € / mois HT"
                    : "130 € / mois HT"}
                </p>
              </div>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={isPro
                ? { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                : { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }
            >
              {isPro ? (status === "trialing" ? "Essai gratuit" : "Actif") : "Gratuit"}
            </span>
          </div>
        </div>
      </div>

      {/* Starter → invite à passer Pro */}
      {!isPro && (
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--surface-1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(245,158,11,0.7)" }}>
              Passer à Pro
            </p>
          </div>
          <div className="px-5 py-5">
            {/* Features */}
            <div className="space-y-3 mb-5">
              {[
                "Notifications email illimitées",
                "Notifications push illimitées",
                "Récompenses illimitées",
                "Personnalisation complète de la carte",
                "Statistiques avancées",
                "Support prioritaire",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2.5} className="w-2.5 h-2.5">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-3xl font-bold text-white">90 €</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>/ mois HT · sans engagement</span>
            </div>

            <Link
              href="/tarifs"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold gold-gradient text-black hover:opacity-90 transition-opacity"
            >
              Démarrer l&apos;essai gratuit — 7 jours
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Pro → gestion */}
      {isPro && (
        <>
          {status === "trialing" && (
            <div className="rounded-xl p-4 mb-4 flex items-start gap-3" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={1.75} className="w-4 h-4 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
              </svg>
              <p className="text-sm" style={{ color: "rgba(245,158,11,0.9)" }}>
                Vous êtes en période d&apos;essai gratuit. Votre premier paiement sera prélevé à la fin de la période d&apos;essai.
              </p>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Gestion
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {[
                { label: "Voir mes factures", desc: "Téléchargez vos factures en PDF" },
                { label: "Modifier mon moyen de paiement", desc: "Mettre à jour votre carte bancaire" },
                { label: "Annuler mon abonnement", desc: "Votre accès reste actif jusqu'à la fin de la période" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.025] transition-colors disabled:opacity-40 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            Toutes les opérations de facturation sont sécurisées par{" "}
            <span className="text-white font-medium">Stripe</span>
          </p>
        </>
      )}
    </div>
  );
}
