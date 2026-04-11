import Link from "next/link";
import FidcoLogo from "@/components/FidcoLogo";

export default function CGV() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <nav className="border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <FidcoLogo size={32} />
            <span className="font-bold text-lg">Fidco</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-slate-400 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition-colors">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mb-2">Conditions Générales de Vente</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Vendeur</h2>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 text-sm">
              <p><strong className="text-white">Kotselas Sacha</strong> — Micro-entrepreneur</p>
              <p>129 Avenue Jean Jaurès, 92290 Châtenay-Malabry, France</p>
              <p>SIRET : 937 571 149 00015</p>
              <p>Email : <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a></p>
              <p className="text-slate-500 text-xs mt-2">
                TVA non applicable, art. 293 B du CGI (franchise en base de TVA).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Offres et tarifs</h2>
            <p>Fidco propose les abonnements suivants aux Professionnels :</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 text-white font-semibold">Formule</th>
                    <th className="text-left py-3 pr-4 text-white font-semibold">Prix mensuel HT</th>
                    <th className="text-left py-3 text-white font-semibold">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-4">Starter</td>
                    <td className="py-3 pr-4">Gratuit</td>
                    <td className="py-3">Sans engagement</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Pro</td>
                    <td className="py-3 pr-4">90 € HT / mois</td>
                    <td className="py-3">Sans engagement, résiliable à tout moment</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Business</td>
                    <td className="py-3 pr-4">130 € HT / mois</td>
                    <td className="py-3">Sans engagement, résiliable à tout moment</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Les prix sont indiqués hors taxes. La TVA n&apos;est pas applicable (franchise en base — art. 293 B CGI).
              Fidco se réserve le droit de modifier ses tarifs avec un préavis de 30 jours par email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Paiement</h2>
            <p>
              Le paiement des abonnements payants est effectué par carte bancaire via la plateforme sécurisée{" "}
              <strong className="text-white">Stripe</strong>. Les coordonnées bancaires ne sont jamais transmises à Fidco.
            </p>
            <p className="mt-3">
              L&apos;abonnement est prélevé mensuellement à la date anniversaire de la souscription.
              En cas d&apos;échec de paiement, l&apos;accès aux fonctionnalités payantes sera suspendu après 7 jours de grâce.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Durée et résiliation</h2>
            <p>
              Les abonnements sont souscrits sans engagement de durée minimale.
              Le Professionnel peut résilier son abonnement à tout moment depuis son espace personnel.
              La résiliation prend effet à la fin de la période mensuelle en cours, sans remboursement au prorata.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Droit de rétractation</h2>
            <p>
              Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique
              pas aux services entièrement exécutés avant la fin du délai de rétractation, avec accord préalable du consommateur.
              Pour les abonnements Fidco, l&apos;accès au service étant immédiat, le droit de rétractation est exclu dès
              l&apos;activation du compte.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Toutefois, si vous n&apos;êtes pas satisfait dans les 7 premiers jours suivant votre souscription,
              contactez-nous à <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a> — nous examinerons votre demande avec bienveillance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Responsabilité</h2>
            <p>
              Fidco s&apos;engage à fournir le service décrit. En cas d&apos;indisponibilité prolongée du service (plus de 72h consécutives)
              imputable à Fidco, un avoir proportionnel pourra être accordé sur demande.
              La responsabilité de Fidco ne saurait excéder le montant mensuel de l&apos;abonnement souscrit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Litiges</h2>
            <p>
              En cas de litige, le Professionnel peut contacter Fidco à{" "}
              <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a>{" "}
              pour une résolution amiable. À défaut, le litige sera porté devant les tribunaux compétents
              conformément au droit français.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français.
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
