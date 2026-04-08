import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const features = [
  {
    icon: "💳",
    title: "Cartes de fidélité digitales",
    description: "Cartes personnalisées directement sur le téléphone de vos clients.",
  },
  {
    icon: "⭐",
    title: "Système de points",
    description: "Vos clients gagnent des points à chaque achat et débloquent des récompenses.",
  },
  {
    icon: "🏆",
    title: "Paliers de récompenses",
    description: "Définissez vos propres récompenses : café offert, réduction, cadeau...",
  },
  {
    icon: "📷",
    title: "Scanner intégré",
    description: "Scannez les cartes de vos clients en un clic depuis votre téléphone.",
  },
  {
    icon: "🔔",
    title: "Notifications",
    description: "Envoyez des offres et promotions directement sur le téléphone de vos clients.",
  },
  {
    icon: "🔗",
    title: "Inscription en 30 secondes",
    description: "Un QR code unique permet à vos clients de rejoindre votre programme.",
  },
];

const categories = [
  "Restaurant", "Coiffeur", "Fleuriste", "Boulangerie", "Café",
  "Spa & Beauté", "Boutique", "Pharmacie", "Et plus encore...",
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as any).role;
    redirect(role === "PROFESSIONAL" ? "/dashboard" : "/espace-client");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">FC</div>
            <span className="font-bold text-xl">Fidco</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/connexion/client" className="text-slate-300 hover:text-white transition-colors text-sm">
              Espace client
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-lg gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity">
              Espace pro
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm mb-6">
            <span>✨</span>
            <span>La fidélité digitale simple et efficace</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-5">
            Fidélisez vos clients<br />
            <span className="text-amber-400">sans effort</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Programme de points, récompenses sur mesure, scanner intégré.
            Tout ce qu'il faut pour garder vos clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity">
              Créer mon espace pro →
            </Link>
            <Link href="/connexion/client" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors">
              J&apos;ai une carte
            </Link>
          </div>
        </div>

        {/* Card preview */}
        <div className="mt-16 max-w-xs mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-white/10" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Carte de fidélité</p>
                  <p className="text-white font-bold text-lg">Le Petit Bistrot</p>
                </div>
                <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">FC</div>
              </div>
              <div className="mb-3">
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-black text-amber-400">320</span>
                  <span className="text-amber-400 font-bold mb-0.5">pts</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-amber-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">🎯 Dessert offert à 500 pts</p>
              </div>
              <div className="flex gap-2">
                {[
                  { pts: 100, label: "Café", unlocked: true },
                  { pts: 500, label: "Dessert", unlocked: false },
                  { pts: 1000, label: "Repas", unlocked: false },
                ].map((r, i) => (
                  <div key={i} className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border text-center ${r.unlocked ? "border-amber-500/40 bg-amber-500/10" : "border-white/10 bg-white/5"}`}>
                    <span className="text-sm">{r.unlocked ? "🏆" : "🔒"}</span>
                    <span className={`text-xs font-bold ${r.unlocked ? "text-amber-400" : "text-slate-500"}`}>{r.pts}pts</span>
                    <span className={`text-xs ${r.unlocked ? "text-white" : "text-slate-600"}`}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-400">Une plateforme complète, simple à utiliser</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Pour tous les commerces</h2>
          <p className="text-slate-400 mb-8">Adapté à tout type d&apos;activité professionnelle</p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-10 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
          <h2 className="text-3xl font-bold mb-3">Prêt à fidéliser vos clients ?</h2>
          <p className="text-slate-400 mb-6">Créez votre espace professionnel en moins de 2 minutes</p>
          <Link href="/register" className="inline-block px-10 py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity">
            Commencer gratuitement →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4 text-center text-slate-500 text-sm">
        <p>© 2026 Fidco · Tous droits réservés</p>
      </footer>
    </div>
  );
}
