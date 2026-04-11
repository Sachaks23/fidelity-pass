import Link from "next/link";
import PricingSection from "@/components/PricingSection";

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-12 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Retour à l&apos;accueil
        </Link>

        {/* Header */}
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">
              FC
            </div>
            <span className="font-bold text-xl tracking-tight">Fidco</span>
          </Link>
        </div>

        {/* Pricing section (client component with toggle) */}
        <PricingSection />

        {/* FAQ */}
        <div className="mt-12 space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: "Puis-je annuler à tout moment ?",
              a: "Oui, sur le plan mensuel. Annulez depuis votre espace Paramètres, sans frais ni formalité. Sur le plan annuel, l'engagement est de 12 mois.",
            },
            {
              q: "Que se passe-t-il si je dépasse 30 clients en Gratuit ?",
              a: "Les nouveaux clients ne peuvent plus s'inscrire tant que vous n'êtes pas passé en Pro. Vos clients existants continuent de fonctionner normalement.",
            },
            {
              q: "La TVA est-elle incluse ?",
              a: "Les prix sont indiqués TTC. Fidco est géré sous le régime de la franchise en base de TVA (art. 293 B CGI) — aucune TVA n'est appliquée.",
            },
            {
              q: "Le plan annuel est-il facturé en une seule fois ?",
              a: "Oui. 564 € sont prélevés en une fois à la souscription, ce qui représente 47 €/mois — soit 20 % d'économie par rapport au mensuel.",
            },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold text-white text-sm mb-1">{item.q}</p>
              <p className="text-slate-400 text-sm">{item.a}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Des questions ?{" "}
          <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:underline">
            Contactez-nous
          </a>
        </p>
      </div>

      <footer className="border-t border-white/10 py-8 px-4 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs">
              FC
            </div>
            <span className="font-bold text-white text-sm">Fidco</span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
            <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
            <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Fidco</p>
        </div>
      </footer>
    </div>
  );
}
