import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const features = [
  {
    icon: "💳",
    title: "Cartes digitales",
    description: "Cartes personnalisées directement sur le téléphone de vos clients. Fini le papier perdu.",
  },
  {
    icon: "⭐",
    title: "Système de points",
    description: "Vos clients gagnent des points à chaque achat et débloquent des récompenses en temps réel.",
  },
  {
    icon: "🏆",
    title: "Récompenses sur mesure",
    description: "Définissez vos propres récompenses : café offert, réduction, cadeau, accès VIP...",
  },
  {
    icon: "📷",
    title: "Scanner intégré",
    description: "Scannez les cartes de vos clients en un clic depuis n'importe quel smartphone.",
  },
  {
    icon: "🔔",
    title: "Notifications push",
    description: "Envoyez des offres et promotions directement sur le téléphone de vos clients.",
  },
  {
    icon: "🔗",
    title: "Inscription en 30 secondes",
    description: "Un QR code unique permet à vos clients de rejoindre votre programme instantanément.",
  },
];

const categories = [
  "🍽️ Restaurant",
  "✂️ Coiffeur",
  "🥐 Boulangerie",
  "☕ Café",
  "💐 Fleuriste",
  "💆 Spa & Beauté",
  "👗 Boutique",
  "💊 Pharmacie",
  "Et plus encore...",
];

const steps = [
  {
    number: "01",
    title: "Créez votre programme",
    description: "Configurez vos récompenses, vos paliers et personnalisez votre carte en quelques minutes.",
  },
  {
    number: "02",
    title: "Vos clients scannent",
    description: "Ils rejoignent via QR code et accumulent des points à chaque visite.",
  },
  {
    number: "03",
    title: "Ils débloquent des récompenses",
    description: "Quand un palier est atteint, vos clients reçoivent leur récompense automatiquement.",
  },
];

const testimonials = [
  {
    name: "Marie-Claire Dupont",
    role: "Propriétaire, Boulangerie Dupont — Lyon",
    avatar: "M",
    content:
      "Depuis Fidco, mes clients reviennent bien plus souvent. La carte digitale c'est simple, ça ne se perd pas, et moi je vois tout en temps réel. Je recommande à tous les commerçants.",
  },
  {
    name: "Karim Benali",
    role: "Gérant, Coiffeur Prestige — Paris 11e",
    avatar: "K",
    content:
      "J'ai essayé les cartes papier pendant des années. Avec Fidco, mes clients adorent suivre leurs points. J'ai vu ma fréquentation augmenter de 30% en 3 mois.",
  },
  {
    name: "Sophie Leclerc",
    role: "Restauratrice, Le Petit Comptoir — Bordeaux",
    avatar: "S",
    content:
      "Mise en place en 20 minutes, vraiment. Le QR code à l'entrée, les clients scannent, et hop. Je n'aurais pas cru que c'était aussi facile.",
  },
];

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
    ctaHref: "/register",
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
    ctaHref: "/register",
    highlight: false,
  },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "PROFESSIONAL" ? "/dashboard" : "/espace-client");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* ─── NAVBAR ────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm select-none">
              FC
            </div>
            <span className="font-bold text-xl tracking-tight">Fidco</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/connexion/client"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium hidden sm:inline"
            >
              Espace client
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Espace pro
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm mb-8 font-medium">
                <span>✨</span>
                <span>La fidélité digitale pour les commerces français</span>
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
                Fidélisez vos clients
                <br />
                <span className="text-amber-400">sans effort.</span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
                Programme de points, récompenses sur mesure, scanner intégré.
                Tout ce qu&apos;il faut pour garder vos clients — dans votre poche.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 transition-opacity text-center"
                >
                  Commencer gratuitement →
                </Link>
                <Link
                  href="#tarifs"
                  className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors text-center"
                >
                  Voir les tarifs
                </Link>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                Aucune carte bancaire requise · Plan gratuit disponible
              </p>
            </div>

            {/* Right: phone mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone shell */}
                <div
                  className="w-64 rounded-[2.5rem] border-4 border-slate-700 bg-[#0f172a] shadow-2xl shadow-amber-500/10 overflow-hidden"
                  style={{ minHeight: "480px" }}
                >
                  {/* Status bar */}
                  <div className="bg-slate-900 px-5 pt-3 pb-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400">9:41</span>
                    <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                    <div className="flex gap-1 items-center">
                      <span className="text-xs text-slate-400">●●●</span>
                    </div>
                  </div>
                  {/* App header */}
                  <div className="px-4 pt-3 pb-2 bg-slate-900/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs">
                        FC
                      </div>
                      <span className="text-xs font-semibold text-white">Fidco</span>
                    </div>
                    <p className="text-xs text-slate-400">Bonjour, Sophie 👋</p>
                  </div>
                  {/* Loyalty card */}
                  <div className="p-3">
                    <div
                      className="rounded-2xl p-4 shadow-lg border border-amber-500/20"
                      style={{
                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Carte fidélité
                          </p>
                          <p className="text-white font-bold text-sm mt-0.5">
                            Le Petit Bistrot
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-xs">
                          FC
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-3xl font-black text-amber-400">320</span>
                          <span className="text-amber-400 font-bold text-sm mb-0.5">pts</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: "64%" }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                          🎯 Dessert offert à 500 pts
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          { pts: 100, label: "Café", unlocked: true },
                          { pts: 500, label: "Dessert", unlocked: false },
                          { pts: 1000, label: "Repas", unlocked: false },
                        ].map((r, i) => (
                          <div
                            key={i}
                            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border text-center ${
                              r.unlocked
                                ? "border-amber-500/40 bg-amber-500/10"
                                : "border-white/10 bg-white/5"
                            }`}
                          >
                            <span className="text-sm">
                              {r.unlocked ? "🏆" : "🔒"}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                r.unlocked ? "text-amber-400" : "text-slate-500"
                              }`}
                            >
                              {r.pts}pts
                            </span>
                            <span
                              className={`text-xs ${
                                r.unlocked ? "text-white" : "text-slate-600"
                              }`}
                            >
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Mini scan button */}
                    <div className="mt-3 w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold text-center">
                      📷 Scanner un point
                    </div>
                  </div>
                </div>
                {/* Decorative glow under phone */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-10 bg-amber-500/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ──────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 border-t border-white/5 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-400 text-sm mb-6 font-medium uppercase tracking-widest">
            Rejoignez 500+ commerçants qui font confiance à Fidco
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full border border-amber-500/25 bg-amber-500/8 text-amber-300 text-sm font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold uppercase tracking-widest text-sm mb-3">
              Simple par design
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Comment ça marche
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              De la configuration au premier scan, tout se fait en quelques minutes.
            </p>
          </div>

          {/* 3 steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative p-7 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <div className="text-5xl font-black text-white/[0.06] absolute top-5 right-6 select-none leading-none">
                  {step.number}
                </div>
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-base mb-5">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Feature grid */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-slate-400">
              Une plateforme complète, pensée pour les commerces de proximité.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold mb-1.5 group-hover:text-amber-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold uppercase tracking-widest text-sm mb-3">
              Tarifs
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Un plan pour chaque commerce
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Commencez gratuitement, évoluez quand vous êtes prêt.
            </p>
          </div>

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
                  <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
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
                      <span
                        className={feat.included ? "text-slate-200" : "text-slate-500"}
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.ctaHref}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${
                    tier.highlight
                      ? "gold-gradient text-black"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold uppercase tracking-widest text-sm mb-3">
              Témoignages
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ils utilisent Fidco au quotidien
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col gap-5"
              >
                <div className="flex text-amber-400 text-sm gap-0.5">
                  {"★★★★★".split("").map((s, j) => (
                    <span key={j}>{s}</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-3xl p-10 sm:p-14 border border-amber-500/20"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(245,158,11,0.12) 0%, transparent 70%)",
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Prêt à fidéliser vos clients ?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Créez votre espace professionnel en moins de 2 minutes. Gratuit pour commencer.
            </p>
            <Link
              href="/register"
              className="inline-block px-10 py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 transition-opacity"
            >
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs">
              FC
            </div>
            <span className="font-bold text-white">Fidco</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <Link href="/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
            <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
            <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
            <a href="mailto:sacha.kotselas@outlook.fr" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
          <p className="text-slate-500 text-sm">© 2025 Fidco</p>
        </div>
      </footer>
    </div>
  );
}
