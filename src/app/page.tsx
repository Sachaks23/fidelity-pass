import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PricingSection from "@/components/PricingSection";
import FidcoLogo from "@/components/FidcoLogo";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" strokeLinecap="round" />
        <path d="M6 15h4" strokeLinecap="round" />
      </svg>
    ),
    title: "Cartes digitales",
    description: "Cartes personnalisées directement sur le téléphone de vos clients. Fini le papier perdu.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Système de points",
    description: "Vos clients gagnent des points à chaque achat et débloquent des récompenses en temps réel.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    title: "Récompenses sur mesure",
    description: "Définissez vos propres récompenses : café offert, réduction, cadeau, accès VIP...",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
        <rect x="7" y="7" width="3" height="3" rx="0.5" />
        <rect x="14" y="7" width="3" height="3" rx="0.5" />
        <rect x="7" y="14" width="3" height="3" rx="0.5" />
        <path d="M14 14h3v3h-3z" />
      </svg>
    ),
    title: "Scanner intégré",
    description: "Scannez les cartes de vos clients en un clic depuis n'importe quel smartphone.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
      </svg>
    ),
    title: "Campagnes automatiques",
    description: "Relancez automatiquement vos clients inactifs ou ceux proches d'une récompense.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
    title: "Inscription en 30 secondes",
    description: "Un QR code unique permet à vos clients de rejoindre votre programme instantanément.",
  },
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

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "PROFESSIONAL" ? "/dashboard" : "/espace-client");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* ─── NAVBAR ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <FidcoLogo size={32} />
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

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm mb-8 font-medium">
                <span>Programme de fidélité digital pour commerces</span>
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
                      <FidcoLogo size={24} />
                      <span className="text-xs font-semibold text-white">Fidco</span>
                    </div>
                    <p className="text-xs text-slate-400">Bonjour, Sophie</p>
                  </div>
                  {/* Loyalty card */}
                  <div className="p-3">
                    <div
                      className="rounded-2xl p-4 shadow-lg border border-amber-500/20"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Carte fidélité
                          </p>
                          <p className="text-white font-bold text-sm mt-0.5">Le Petit Bistrot</p>
                        </div>
                        <FidcoLogo size={32} />
                      </div>
                      <div className="mb-3">
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-3xl font-black text-amber-400">320</span>
                          <span className="text-amber-400 font-bold text-sm mb-0.5">pts</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: "64%" }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">Dessert offert à 500 pts</p>
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
                            <span className={`text-xs font-bold ${r.unlocked ? "text-amber-400" : "text-slate-500"}`}>
                              {r.pts}pts
                            </span>
                            <span className={`text-xs ${r.unlocked ? "text-white" : "text-slate-600"}`}>
                              {r.label}
                            </span>
                            {r.unlocked && (
                              <span className="text-amber-400 text-xs font-bold">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Scan button */}
                    <div className="mt-3 w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold text-center">
                      Scanner un point
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-10 bg-amber-500/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/5">
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
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
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
                <div className="text-amber-400 mb-4 group-hover:scale-110 transition-transform origin-left">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-1.5 group-hover:text-amber-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────── */}
      <PricingSection />

      {/* ─── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-3xl p-10 sm:p-14 border border-amber-500/20"
            style={{
              background: "radial-gradient(ellipse at top, rgba(245,158,11,0.12) 0%, transparent 70%)",
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

      {/* ─── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <FidcoLogo size={28} />
            <span className="font-bold text-white">Fidco</span>
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <Link href="/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
            <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
            <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
            <a href="mailto:sacha.kotselas@outlook.fr" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Fidco</p>
        </div>
      </footer>
    </div>
  );
}
