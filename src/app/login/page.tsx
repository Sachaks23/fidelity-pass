import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginChoicePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as any).role;
    redirect(role === "PROFESSIONAL" ? "/dashboard" : "/espace-client");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-lg">FP</div>
            <span className="font-bold text-3xl text-white">Fidelity Pass</span>
          </Link>
          <p className="text-slate-400 mt-3">À quel espace souhaitez-vous accéder ?</p>
        </div>

        {/* Deux boutons distincts */}
        <div className="space-y-4">

          {/* Espace Pro */}
          <Link href="/connexion/pro" className="block">
            <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center text-2xl flex-shrink-0">
                  🏪
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors">
                    Espace Professionnel
                  </p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Restaurateur, coiffeur, fleuriste…
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Dashboard · Clients · Scanner · Notifications
                  </p>
                </div>
                <span className="text-amber-500 text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Espace Client */}
          <Link href="/connexion/client" className="block">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                  💳
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg group-hover:text-slate-200 transition-colors">
                    Espace Client
                  </p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Accédez à vos cartes de fidélité
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Mes cartes · Historique · Mon compte
                  </p>
                </div>
                <span className="text-slate-500 text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Créer un compte pro */}
        <div className="text-center mt-8 pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm">
            Vous êtes professionnel et n&apos;avez pas encore de compte ?
          </p>
          <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium text-sm mt-1 inline-block">
            Créer mon espace professionnel →
          </Link>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Les clients s&apos;inscrivent via le QR code de leur commerce.
        </p>
      </div>
    </div>
  );
}
