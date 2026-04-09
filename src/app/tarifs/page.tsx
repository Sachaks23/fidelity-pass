import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";
import { PLANS } from "@/lib/stripe";

const features = [
  { text: "Clients illimités", included: true },
  { text: "Scans illimités", included: true },
  { text: "Récompenses illimitées", included: true },
  { text: "Notifications push", included: true },
  { text: "Support prioritaire", included: true },
  { text: "7 jours d'essai gratuit", included: true },
];

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-12 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Retour à l&apos;accueil
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">FC</div>
            <span className="font-bold text-xl tracking-tight">Fidco</span>
          </Link>
          <p className="text-amber-400 font-semibold uppercase tracking-widest text-sm mb-3">Tarif unique</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Simple et sans surprise
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Une seule formule. Toutes les fonctionnalités. 7 jours gratuits pour tester.
          </p>
        </div>

        {/* Single pricing card */}
        <div className="relative rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent shadow-xl shadow-amber-500/10 p-8 sm:p-10">
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="px-5 py-1.5 rounded-full gold-gradient text-black text-sm font-bold">
              7 jours gratuits
            </span>
          </div>

          <div className="text-center mb-8 mt-2">
            <h2 className="text-2xl font-bold mb-1">Fidco Pro</h2>
            <p className="text-slate-400 text-sm mb-6">Pour les commerçants qui veulent fidéliser sérieusement.</p>
            <div className="flex items-end justify-center gap-2">
              <span className="text-6xl font-extrabold">90€</span>
              <span className="text-slate-400 text-base mb-2">/ mois HT</span>
            </div>
            <p className="text-slate-500 text-sm mt-2">Puis 90€/mois. Annulation à tout moment.</p>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="text-amber-400 flex-shrink-0 text-base">✓</span>
                <span className="text-slate-200">{feat.text}</span>
              </li>
            ))}
          </ul>

          <SubscribeButton
            priceId={PLANS.PRO.priceId}
            planName="Pro"
            highlight={true}
          />

          <p className="text-center text-slate-500 text-xs mt-4">
            Aucun débit pendant l&apos;essai. CB demandée pour activer le compte.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          {[
            { q: "Comment fonctionne l'essai gratuit ?", a: "Vous accédez à toutes les fonctionnalités pendant 7 jours sans être débité. Votre CB est demandée pour activer le compte mais ne sera prélevée qu'à la fin de la période d'essai." },
            { q: "Puis-je annuler à tout moment ?", a: "Oui. Annulez depuis votre espace dans les paramètres, sans frais ni engagement." },
            { q: "La TVA est-elle incluse ?", a: "Les prix sont indiqués HT. Fidco est géré par un micro-entrepreneur sous franchise TVA (art. 293 B CGI) — aucune TVA ne sera ajoutée." },
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
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs">FC</div>
            <span className="font-bold text-white text-sm">Fidco</span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
            <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
            <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
          </div>
          <p className="text-slate-500 text-sm">© 2025 Fidco</p>
        </div>
      </footer>
    </div>
  );
}
