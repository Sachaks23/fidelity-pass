import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";
import { PLANS } from "@/lib/stripe";

const pricingTiers = [
  {
    name: "Starter",
    price: "Gratuit",
    priceNote: "pour toujours",
    description: "Pour découvrir Fidco sans engagement.",
    badge: null,
    features: [
      { text: "Jusqu'à 50 clients", included: true },
      { text: "100 scans / mois", included: true },
      { text: "1 récompense configurée", included: true },
      { text: "Notifications push", included: false },
      { text: "Support prioritaire", included: false },
      { text: "Statistiques avancées", included: false },
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/register",
    priceId: null,
    highlight: false,
  },
  {
    name: "Pro",
    price: "90€",
    priceNote: "/ mois HT",
    description: "Pour les commerçants qui veulent fidéliser sérieusement.",
    badge: "Populaire",
    features: [
      { text: "Clients illimités", included: true },
      { text: "Scans illimités", included: true },
      { text: "Récompenses illimitées", included: true },
      { text: "Notifications push", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Statistiques avancées", included: false },
    ],
    cta: "Démarrer l'essai Pro",
    ctaHref: null,
    priceId: PLANS.PRO.priceId,
    highlight: true,
  },
  {
    name: "Business",
    price: "130€",
    priceNote: "/ mois HT",
    description: "Pour les enseignes avec plusieurs points de vente.",
    badge: null,
    features: [
      { text: "Tout ce qui est inclus dans Pro", included: true },
      { text: "Statistiques avancées", included: true },
      { text: "Support dédié", included: true },
      { text: "Multi-établissements (bientôt)", included: true },
      { text: "Intégrations sur mesure", included: true },
      { text: "Onboarding personnalisé", included: true },
    ],
    cta: "Contacter l'équipe",
    ctaHref: null,
    priceId: PLANS.BUSINESS.priceId,
    highlight: false,
  },
];

export default async function TarifsPage() {

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Subtle glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-12 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Retour à l&apos;accueil
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">
                FC
              </div>
              <span className="font-bold text-xl tracking-tight">Fidco</span>
            </Link>
          </div>
          <p className="text-amber-400 font-semibold uppercase tracking-widest text-sm mb-3">
            Tarifs
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Un plan pour chaque commerce
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Commencez gratuitement, évoluez quand vous êtes prêt. Pas d&apos;engagement.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {pricingTiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                tier.highlight
                  ? "border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent shadow-xl shadow-amber-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full gold-gradient text-black text-xs font-bold">
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-1">{tier.name}</h2>
                <p className="text-slate-400 text-sm mb-4">{tier.description}</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-slate-500 text-sm mb-1">{tier.priceNote}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    {feat.included ? (
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">✓</span>
                    ) : (
                      <span className="text-slate-600 mt-0.5 flex-shrink-0">✕</span>
                    )}
                    <span className={feat.included ? "text-slate-200" : "text-slate-500"}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.priceId ? (
                <SubscribeButton
                  priceId={tier.priceId}
                  planName={tier.name}
                  highlight={tier.highlight}
                />
              ) : (
                <Link
                  href={tier.ctaHref ?? "/register"}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${
                    tier.highlight
                      ? "gold-gradient text-black"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-500 text-sm mt-10">
          Tous les prix sont HT. Annulation à tout moment.{" "}
          <Link href="/contact" className="text-amber-400 hover:underline">
            Des questions ?
          </Link>
        </p>
      </div>

      {/* Minimal footer */}
      <footer className="border-t border-white/10 py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs">
              FC
            </div>
            <span className="font-bold text-white text-sm">Fidco</span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/cgu" className="hover:text-slate-300 transition-colors">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">
              Confidentialité
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-slate-500 text-sm">© 2025 Fidco</p>
        </div>
      </footer>
    </div>
  );
}
