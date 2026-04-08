import Link from "next/link";

const features = [
  {
    icon: "💳",
    title: "Cartes de fidélité digitales",
    description: "Créez des cartes personnalisées exportables directement sur Apple Wallet et Google Wallet.",
  },
  {
    icon: "📊",
    title: "Dashboard complet",
    description: "Suivez vos statistiques clés : clients inscrits, scans quotidiens, historique détaillé.",
  },
  {
    icon: "🔔",
    title: "Notifications push",
    description: "Envoyez des offres et promotions directement sur le téléphone de vos clients.",
  },
  {
    icon: "📱",
    title: "Scanner intégré",
    description: "Scannez les QR codes de vos clients depuis votre tableau de bord.",
  },
  {
    icon: "🎯",
    title: "Fichier client complet",
    description: "Accédez à l'historique d'achats et de récompenses de chaque client.",
  },
  {
    icon: "🔗",
    title: "Inscription simplifiée",
    description: "Un QR code unique permet à vos clients de s'inscrire en quelques secondes.",
  },
];

const categories = [
  "Restaurant", "Coiffeur", "Fleuriste", "Boulangerie", "Café",
  "Spa & Beauté", "Boutique", "Pharmacie", "Et plus encore...",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">FP</div>
            <span className="font-bold text-xl">Fidelity Pass</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors text-sm">
              Connexion
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity">
              Démarrer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm mb-8">
            <span>✨</span>
            <span>La fidélité digitale pour votre commerce</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Votre programme de<br />
            <span className="text-amber-400">fidélité digital</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Créez des cartes de fidélité exportables sur Apple Wallet et Google Wallet.
            Gérez vos clients, envoyez des notifications push et boostez leur fidélisation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity">
              Créer mon espace pro →
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>

        {/* Floating card preview */}
        <div className="mt-20 max-w-sm mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-white/10" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Carte de fidélité</p>
                  <p className="text-white font-bold text-lg">Le Petit Bistrot</p>
                </div>
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold">FP</div>
              </div>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${i < 7 ? "stamp-filled" : "border-2 border-white/20"}`}>
                    {i < 7 ? "⭐" : ""}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Marie Dupont</p>
                  <p className="text-amber-400 text-sm font-medium">7/10 tampons</p>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  <p>Récompense</p>
                  <p className="text-white">Café offert</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-400 text-lg">Une plateforme complète pour gérer votre programme de fidélité</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Pour tous les commerces</h2>
          <p className="text-slate-400 text-lg mb-10">Adapté à tout type d'activité professionnelle</p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
          <h2 className="text-4xl font-bold mb-4">Prêt à fidéliser vos clients ?</h2>
          <p className="text-slate-400 text-lg mb-8">Créez votre espace professionnel en moins de 2 minutes</p>
          <Link href="/register" className="inline-block px-10 py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity">
            Commencer maintenant →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-slate-500 text-sm">
        <p>© 2024 Fidelity Pass · Tous droits réservés</p>
      </footer>
    </div>
  );
}
