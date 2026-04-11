"use client";
import { useState, use, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface BusinessInfo {
  name: string;
  category: string;
  address: string | null;
  description: string | null;
  cardBgColor: string;
  cardFgColor: string;
  cardAccentColor: string;
  stampsRequired: number;
  rewardLabel: string;
}

function RejoindreInner({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [business, setBusiness] = useState<BusinessInfo | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetch(`/api/public/business/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setBusiness(data);
      })
      .catch(console.error);
  }, [slug]);

  function update(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessSlug: slug, ...form, referralCode: referralCode || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'inscription");
      setSubmitting(false);
      return;
    }

    setStep("loading");
    const loginResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (loginResult?.ok) {
      window.location.href = "/espace-client";
    } else {
      setStep("success");
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white text-xl font-semibold">Création de votre carte...</p>
          <p className="text-slate-400 mt-2">Vous allez être redirigé automatiquement</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-2xl mx-auto mb-6">FC</div>
          <h1 className="text-3xl font-bold text-white mb-4">Bienvenue !</h1>
          <p className="text-slate-400 text-lg mb-2">
            Votre carte de fidélité chez <strong className="text-white">{business?.name || "votre commerce"}</strong> est prête.
          </p>
          {referralCode && (
            <p className="text-amber-400 text-sm mb-4">Points de bienvenue parrainage crédités !</p>
          )}
          <p className="text-slate-500 text-sm mb-8">
            Connectez-vous pour voir votre carte et l&apos;ajouter à votre Wallet.
          </p>
          <a
            href="/connexion/client"
            className="inline-block px-8 py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Accéder à mon espace →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-2xl mx-auto mb-4">FC</div>
          {business ? (
            <>
              <h1 className="text-3xl font-bold text-white">{business.name}</h1>
              <p className="text-amber-400 text-sm mt-1">{business.category}</p>
              {business.address && (
                <p className="text-slate-500 text-xs mt-1">{business.address}</p>
              )}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                Récompense : <strong>{business.rewardLabel}</strong> après {business.stampsRequired} tampons
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white">Rejoignez le programme</h1>
              <p className="text-slate-400 mt-2">Chargement...</p>
            </>
          )}
        </div>

        {business && (
          <div
            className="rounded-2xl p-5 mb-6 border border-white/10 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${business.cardBgColor}, ${business.cardBgColor}cc)` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-50" style={{ color: business.cardFgColor }}>Votre future carte</p>
                <p className="font-bold" style={{ color: business.cardFgColor }}>{business.name}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: business.cardAccentColor, color: "#000" }}>FC</div>
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              {Array.from({ length: business.stampsRequired }).map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 opacity-40"
                  style={{ borderColor: business.cardFgColor }} />
              ))}
            </div>
            <p className="text-xs opacity-50" style={{ color: business.cardFgColor }}>
              {business.stampsRequired} tampons = {business.rewardLabel}
            </p>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-5">Créer mon compte gratuitement</h2>

          {referralCode && (
            <div className="p-3 rounded-lg mb-4 text-sm" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa" }}>
              Vous êtes parrainé — vous recevrez des points bonus à l&apos;inscription !
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom *</label>
                <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                  required className={inputClass} placeholder="Marie" autoComplete="given-name" />
              </div>
              <div>
                <label className={labelClass}>Nom *</label>
                <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                  required className={inputClass} placeholder="Dupont" autoComplete="family-name" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                required className={inputClass} placeholder="marie@email.com" autoComplete="email" />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className={inputClass} placeholder="+33 6 12 34 56 78" autoComplete="tel" />
            </div>
            <div>
              <label className={labelClass}>
                Mot de passe *
                <span className="text-slate-500 font-normal ml-1">(pour accéder à votre espace)</span>
              </label>
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                required minLength={6} className={inputClass} placeholder="Minimum 6 caractères" autoComplete="new-password" />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Création de votre carte..." : "Obtenir ma carte de fidélité"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-5">
            Déjà un compte ?{" "}
            <a href="/connexion/client" className="text-amber-400 hover:underline">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RejoindreBusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RejoindreInner params={params} />
    </Suspense>
  );
}
