"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur serveur");
    } else {
      setSuccess(true);
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
          <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">🔑</div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Nouveau mot de passe</h1>
            <p className="text-slate-400 text-sm">Choisissez un mot de passe sécurisé</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-white font-bold text-lg mb-2">Mot de passe mis à jour !</h2>
              <p className="text-slate-400 text-sm mb-6">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <Link
                href="/connexion/client"
                className="w-full block py-3.5 rounded-xl gold-gradient text-black font-bold text-base text-center hover:opacity-90 transition-opacity"
              >
                Se connecter
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    minLength={6}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-base"
                    placeholder="Minimum 6 caractères"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-base"
                    placeholder="Répétez le mot de passe"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl gold-gradient text-black font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
