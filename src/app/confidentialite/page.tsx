import Link from "next/link";
import FidcoLogo from "@/components/FidcoLogo";

export default function Confidentialite() {
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

        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est :{" "}
              <strong className="text-white">Kotselas Sacha</strong>, micro-entrepreneur,
              129 Avenue Jean Jaurès, 92290 Châtenay-Malabry — SIRET 937 571 149 00015.
            </p>
            <p className="mt-2">
              Contact : <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Données collectées</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Pour les Professionnels :</h3>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li>Nom, prénom, adresse email</li>
                  <li>Nom du commerce</li>
                  <li>Données de connexion (email, mot de passe chiffré)</li>
                  <li>Données d&apos;abonnement (via Stripe)</li>
                  <li>Données d&apos;utilisation (scans, clients, récompenses)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">Pour les Clients :</h3>
                <ul className="list-disc pl-6 text-sm space-y-1">
                  <li>Nom, prénom, adresse email</li>
                  <li>Données de connexion (email, mot de passe chiffré)</li>
                  <li>Historique des points et récompenses</li>
                  <li>Historique des scans</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Finalités du traitement</h2>
            <ul className="list-disc pl-6 text-sm space-y-2">
              <li>Création et gestion des comptes utilisateurs</li>
              <li>Fourniture du service de fidélisation (gestion des points, récompenses, scans)</li>
              <li>Gestion des abonnements et facturation</li>
              <li>Envoi de notifications liées au service</li>
              <li>Amélioration de la plateforme</li>
              <li>Respect des obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Base légale</h2>
            <ul className="list-disc pl-6 text-sm space-y-2">
              <li><strong className="text-white">Exécution du contrat</strong> — pour la fourniture du service</li>
              <li><strong className="text-white">Intérêt légitime</strong> — pour l&apos;amélioration du service et la sécurité</li>
              <li><strong className="text-white">Obligation légale</strong> — pour la conservation des données de facturation</li>
              <li><strong className="text-white">Consentement</strong> — pour l&apos;envoi de communications marketing (si applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Durée de conservation</h2>
            <ul className="list-disc pl-6 text-sm space-y-2">
              <li>Données de compte : pendant toute la durée de l&apos;abonnement + 3 ans après résiliation</li>
              <li>Données de facturation : 10 ans (obligation comptable)</li>
              <li>Données de connexion et logs : 12 mois</li>
              <li>Données supprimées sur demande : dans un délai de 30 jours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Sous-traitants et transferts</h2>
            <p>Fidco utilise les prestataires suivants pour faire fonctionner le service :</p>
            <div className="mt-3 space-y-2 text-sm">
              {[
                { name: "Vercel Inc.", role: "Hébergement de l'application", country: "États-Unis (SCC)" },
                { name: "Turso (ChiselStrike)", role: "Base de données", country: "États-Unis (SCC)" },
                { name: "Stripe Inc.", role: "Paiement en ligne", country: "États-Unis (SCC)" },
                { name: "Resend Inc.", role: "Envoi d'emails transactionnels", country: "États-Unis (SCC)" },
              ].map((p) => (
                <div key={p.name} className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="font-medium text-white">{p.name}</span>
                  <span className="text-slate-400">{p.role}</span>
                  <span className="text-slate-500">{p.country}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              SCC = Clauses Contractuelles Types approuvées par la Commission européenne, garantissant un niveau de protection adéquat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 mt-3 text-sm space-y-2">
              <li><strong className="text-white">Droit d&apos;accès</strong> — obtenir une copie de vos données</li>
              <li><strong className="text-white">Droit de rectification</strong> — corriger vos données inexactes</li>
              <li><strong className="text-white">Droit à l&apos;effacement</strong> — supprimer votre compte et vos données</li>
              <li><strong className="text-white">Droit à la portabilité</strong> — recevoir vos données dans un format structuré</li>
              <li><strong className="text-white">Droit d&apos;opposition</strong> — vous opposer à certains traitements</li>
              <li><strong className="text-white">Droit à la limitation</strong> — limiter le traitement de vos données</li>
            </ul>
            <p className="mt-4 text-sm">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a>.
              Nous répondrons dans un délai de 30 jours.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Vous pouvez également introduire une réclamation auprès de la{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">CNIL</a>{" "}
              si vous estimez que vos droits ne sont pas respectés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Cookies</h2>
            <p>
              Fidco utilise uniquement des cookies strictement nécessaires au fonctionnement du service
              (authentification, sécurité de session). Aucun cookie de tracking ou publicitaire n&apos;est utilisé.
            </p>
            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
              <p className="font-medium text-white mb-2">Cookies utilisés :</p>
              <ul className="space-y-2 text-slate-400">
                <li><span className="text-slate-300 font-mono text-xs">__Secure-next-auth.session-token</span> — session d&apos;authentification (30 jours, httpOnly)</li>
                <li><span className="text-slate-300 font-mono text-xs">next-auth.csrf-token</span> — protection contre les attaques CSRF (session)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Sécurité</h2>
            <p>
              Fidco met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :
              chiffrement des mots de passe (bcrypt), connexions HTTPS, tokens JWT sécurisés,
              accès aux données restreint au strict nécessaire.
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
