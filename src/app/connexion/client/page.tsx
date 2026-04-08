"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ClientLoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      window.location.href = "/espace-client";
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col px-4 pt-6 pb-10">
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors self-start mb-10"
      >
        ← Retour
      </Link>

      {/* Content area */}
      <div className="w-full max-w-md mx-auto">

        {/* Header — compact */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">💳</div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Espace Client</h1>
            <p className="text-slate-400 text-sm">Vos cartes de fidélité</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {registered && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-5 flex items-start gap-2">
              <span>🎉</span>
              <div>
                <p className="font-semibold">Carte créée !</p>
                <p className="text-green-300/80 text-xs mt-0.5">Connectez-vous pour la voir.</p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-base"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-base"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Connexion en cours..." : "Accéder à mes cartes 💳"}
            </button>
          </form>
          <div className="flex items-center justify-between mt-5">
            <p className="text-slate-500 text-xs">
              Pas de compte ? Scannez le QR code.
            </p>
            <Link
              href="/mot-de-passe-oublie"
              className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense>
      <ClientLoginForm />
    </Suspense>
  );
}
