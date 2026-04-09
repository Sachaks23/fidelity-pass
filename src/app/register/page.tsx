"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = [
  "Restaurant", "Bar / Café", "Coiffeur", "Barbier", "Fleuriste",
  "Boulangerie / Pâtisserie", "Spa & Beauté", "Boutique de vêtements",
  "Librairie", "Épicerie fine", "Pharmacie", "Autre",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessCategory: "",
    businessAddress: "",
    businessPhone: "",
    businessDescription: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role: "PROFESSIONAL",
        businessName: form.businessName,
        businessCategory: form.businessCategory,
        businessAddress: form.businessAddress,
        businessPhone: form.businessPhone,
        businessDescription: form.businessDescription,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur lors de l'inscription");
      setLoading(false);
    } else {
      router.push("/connexion/pro?registered=1");
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold">FC</div>
            <span className="font-bold text-2xl text-white">Fidco</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Créer votre espace pro</h1>
          <p className="text-slate-400 mt-2">Étape {step}/2</p>
          <div className="flex gap-2 mt-4 justify-center">
            <div className={`h-1 w-20 rounded-full ${step >= 1 ? "gold-gradient" : "bg-white/10"}`} />
            <div className={`h-1 w-20 rounded-full ${step >= 2 ? "gold-gradient" : "bg-white/10"}`} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Informations de connexion</h2>
              <div>
                <label className={labelClass}>Email professionnel</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                  required className={inputClass} placeholder="votre@email.com" />
              </div>
              <div>
                <label className={labelClass}>Mot de passe</label>
                <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                  required className={inputClass} placeholder="Minimum 8 caractères" />
              </div>
              <div>
                <label className={labelClass}>Confirmer le mot de passe</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                  required className={inputClass} placeholder="••••••••" />
              </div>
              <button
                onClick={() => {
                  if (!form.email || !form.password || form.password !== form.confirmPassword) {
                    setError("Veuillez remplir tous les champs correctement");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Continuer →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Informations de votre commerce</h2>
              <div>
                <label className={labelClass}>Nom du commerce *</label>
                <input type="text" value={form.businessName} onChange={(e) => update("businessName", e.target.value)}
                  required className={inputClass} placeholder="Le Petit Bistrot" />
              </div>
              <div>
                <label className={labelClass}>Catégorie *</label>
                <select value={form.businessCategory} onChange={(e) => update("businessCategory", e.target.value)}
                  required className={inputClass + " cursor-pointer"}>
                  <option value="" disabled>Sélectionnez une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Adresse</label>
                <input type="text" value={form.businessAddress} onChange={(e) => update("businessAddress", e.target.value)}
                  className={inputClass} placeholder="123 rue de la Paix, Paris" />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input type="tel" value={form.businessPhone} onChange={(e) => update("businessPhone", e.target.value)}
                  className={inputClass} placeholder="+33 1 23 45 67 89" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors">
                  ← Retour
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl gold-gradient text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-slate-400 text-sm mt-6">
            Déjà un compte ?{" "}
            <Link href="/connexion/pro" className="text-amber-400 hover:text-amber-300 font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
