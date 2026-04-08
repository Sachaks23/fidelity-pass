"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur serveur");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col px-4 pt-6 pb-10">
      <Link
        href="/connexion/client"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors self-start mb-10"
      >
        ← Retour
      </Link>

      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">🔐</div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Mot de passe oublié</h1>
            <p className="text-slate-400 text-sm">On vous envoie un lien de réinitialisation</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-white font-bold text-lg mb-2">Email envoyé !</h2>
              <p className="text-slate-400 text-sm mb-6">
                Si un compte existe pour <strong className="text-white">{email}</strong>, vous recevrez un lien dans quelques minutes.
              </p>
              <p className="text-slate-500 text-xs mb-6">Pensez à vérifier vos spams.</p>
              <Link
                href="/connexion/client"
                className="w-full block py-3.5 rounded-xl gold-gradient text-black font-bold text-base text-center hover:opacity-90 transition-opacity"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Votre adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-base"
                    placeholder="votre@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien 📧"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
