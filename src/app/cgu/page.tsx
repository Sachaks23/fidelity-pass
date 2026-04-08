import Link from "next/link";

export default function CGU() {
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

        <h1 className="text-3xl font-bold mb-2">Conditions Générales d&apos;Utilisation</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme
              <strong className="text-white"> Fidco</strong>, éditée par Kotselas Sacha (micro-entrepreneur, SIRET 937 571 149 00015).
              En accédant à la plateforme, l&apos;utilisateur accepte sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Définitions</h2>
            <ul className="space-y-2 text-sm">
              <li><strong className="text-white">Plateforme :</strong> le service Fidco accessible via le site web et l&apos;application mobile.</li>
              <li><strong className="text-white">Professionnel :</strong> toute personne physique ou morale utilisant Fidco pour créer et gérer un programme de fidélité.</li>
              <li><strong className="text-white">Client :</strong> toute personne physique qui s&apos;inscrit à un programme de fidélité via un QR code fourni par un Professionnel.</li>
              <li><strong className="text-white">Compte :</strong> espace personnel créé lors de l&apos;inscription sur la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Accès au service</h2>
            <p>
              L&apos;accès à Fidco nécessite la création d&apos;un compte avec une adresse email valide et un mot de passe.
              L&apos;utilisateur est responsable de la confidentialité de ses identifiants.
              Fidco se réserve le droit de suspendre ou supprimer tout compte en cas d&apos;utilisation frauduleuse ou contraire aux présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Utilisation du service</h2>
            <p>L&apos;utilisateur s&apos;engage à :</p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-sm">
              <li>Ne pas utiliser la plateforme à des fins illicites ou frauduleuses.</li>
              <li>Ne pas tenter de porter atteinte au bon fonctionnement du service.</li>
              <li>Fournir des informations exactes lors de son inscription.</li>
              <li>Respecter les droits des autres utilisateurs.</li>
              <li>Ne pas diffuser de contenu offensant, illégal ou trompeur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Propriété intellectuelle</h2>
            <p>
              La plateforme Fidco, son code source, son design, ses contenus et sa marque sont la propriété exclusive de Kotselas Sacha.
              Toute reproduction ou utilisation sans autorisation préalable est interdite.
              Les Professionnels conservent la propriété de leurs données (nom, logo, récompenses configurées).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Disponibilité du service</h2>
            <p>
              Fidco s&apos;efforce d&apos;assurer la disponibilité du service 24h/24 et 7j/7. Cependant, des interruptions pour
              maintenance ou en cas de force majeure peuvent survenir. Fidco ne saurait être tenu responsable
              de l&apos;indisponibilité temporaire du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Responsabilité</h2>
            <p>
              Fidco est un outil mis à disposition des commerçants. La relation entre le Professionnel et ses Clients
              relève de la seule responsabilité du Professionnel. Fidco ne saurait être tenu responsable des
              litiges entre Professionnels et Clients concernant les récompenses proposées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Suppression du compte</h2>
            <p>
              Tout utilisateur peut demander la suppression de son compte à tout moment en contactant{" "}
              <a href="mailto:sacha.kotselas@outlook.fr" className="text-amber-400 hover:text-amber-300">sacha.kotselas@outlook.fr</a>.
              La suppression entraîne la perte définitive des données associées au compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Modification des CGU</h2>
            <p>
              Fidco se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés de toute modification substantielle par email.
              La poursuite de l&apos;utilisation du service vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige sera porté devant les tribunaux compétents
              du ressort de Châtenay-Malabry, France.
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
