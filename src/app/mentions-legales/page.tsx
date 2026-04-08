import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <nav className="border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">FC</div>
            <span className="font-bold text-lg">Fidco</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-slate-400 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition-colors">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mb-2">Mentions légales</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Éditeur du site</h2>
            <p>Le site <strong className="text-white">fidco.fr</strong> est édité par :</p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 text-sm">
              <p><span className="text-slate-400">Nom :</span> <strong className="text-white">Kotselas Sacha</strong></p>
              <p><span className="text-slate-400">Statut :</span> Micro-entrepreneur</p>
              <p><span className="text-slate-400">Adresse :</span> 129 Avenue Jean Jaurès, 92290 Châtenay-Malabry, France</p>
              <p><span className="text-slate-400">SIRET :</span> 937 571 149 00015</p>
              <p><span className="text-slate-400">Email :</span> <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 text-sm">
              <p><strong className="text-white">Vercel Inc.</strong></p>
              <p>340 Pine Street, Suite 501, San Francisco, CA 94104, États-Unis</p>
              <p><a href="https://vercel.com" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
            </div>
            <p className="mt-4">La base de données est hébergée par <strong className="text-white">Turso (ChiselStrike Inc.)</strong>, San Francisco, États-Unis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, graphismes, logo, icônes, code source) est la propriété exclusive de Kotselas Sacha,
              sauf mentions contraires. Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle,
              est interdite sans l'accord préalable et écrit de l'éditeur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Limitation de responsabilité</h2>
            <p>
              L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
              Cependant, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
              En conséquence, l'éditeur décline toute responsabilité pour toute imprécision, inexactitude ou omission
              portant sur des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Contact</h2>
            <p>
              Pour toute question relative aux mentions légales, vous pouvez contacter l'éditeur à l'adresse suivante :{" "}
              <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <Link href="/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
          <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
          <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
        </div>
      </footer>
    </div>
  );
}
