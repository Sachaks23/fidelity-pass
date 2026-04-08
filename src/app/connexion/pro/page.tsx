"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ProLoginForm() {
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
      window.location.href = "/go";
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            ← Retour
          </Link>
          <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-2xl mx-auto mb-4">🏪</div>
          <h1 className="text-3xl font-bold text-white">Espace Professionnel</h1>
          <p className="text-slate-400 mt-2">Connectez-vous à votre dashboard</p>
        </div>

        <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-8">
          {registered && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-5 flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-semibold">Compte créé avec succès !</p>
                <p className="text-green-300/80 mt-0.5 text-xs">Connectez-vous pour accéder à votre dashboard.</p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Connexion..." : "Accéder à mon dashboard"}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium">Créer un compte pro</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProLoginPage() {
  return <Suspense><ProLoginForm /></Suspense>;
}
