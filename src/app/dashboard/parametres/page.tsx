"use client";
import { useState, useEffect } from "react";

export default function ParametresPage() {
  const [business, setBusiness] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((b) => {
        setBusiness(b);
        setForm({
          name: b.name,
          address: b.address || "",
          phone: b.phone || "",
          description: b.description || "",
          cardBgColor: b.cardBgColor,
          cardFgColor: b.cardFgColor,
          cardAccentColor: b.cardAccentColor,
          stampsRequired: b.stampsRequired,
          rewardLabel: b.rewardLabel,
        });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(key: string, value: any) {
    setForm((p: any) => ({ ...p, [key]: value }));
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  if (loading) return <div className="text-slate-500 animate-pulse">Chargement...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        <p className="text-slate-400 mt-1">Personnalisez votre programme de fidélité</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business info */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-5">
          <h2 className="text-lg font-bold text-white">Informations du commerce</h2>
          <div>
            <label className={labelClass}>Nom du commerce</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Adresse</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="123 rue..." />
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              rows={3} className={inputClass + " resize-none"} placeholder="Décrivez votre établissement..." />
          </div>
        </div>

        {/* Loyalty program */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-5">
          <h2 className="text-lg font-bold text-white">Programme de fidélité</h2>
          <div>
            <label className={labelClass}>Nombre de tampons pour une récompense</label>
            <input type="number" min={1} max={50} value={form.stampsRequired}
              onChange={(e) => update("stampsRequired", parseInt(e.target.value))}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Libellé de la récompense</label>
            <input type="text" value={form.rewardLabel} onChange={(e) => update("rewardLabel", e.target.value)}
              className={inputClass} placeholder="Café offert, -10% de réduction..." />
          </div>
        </div>

        {/* Card design */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-5">
          <h2 className="text-lg font-bold text-white">Design de la carte</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Couleur de fond</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.cardBgColor} onChange={(e) => update("cardBgColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-white/10 bg-transparent" />
                <input type="text" value={form.cardBgColor} onChange={(e) => update("cardBgColor", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Couleur du texte</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.cardFgColor} onChange={(e) => update("cardFgColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-white/10 bg-transparent" />
                <input type="text" value={form.cardFgColor} onChange={(e) => update("cardFgColor", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Couleur d&apos;accent</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.cardAccentColor} onChange={(e) => update("cardAccentColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-white/10 bg-transparent" />
                <input type="text" value={form.cardAccentColor} onChange={(e) => update("cardAccentColor", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" />
              </div>
            </div>
          </div>

          {/* Card preview */}
          <div>
            <label className={labelClass}>Aperçu de la carte</label>
            <div className="rounded-2xl overflow-hidden border border-white/10 max-w-xs" style={{ background: `linear-gradient(135deg, ${form.cardBgColor}, ${form.cardBgColor}dd)` }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60" style={{ color: form.cardFgColor }}>Carte de fidélité</p>
                    <p className="font-bold text-lg" style={{ color: form.cardFgColor }}>{form.name}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: form.cardAccentColor, color: "#000" }}>FP</div>
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {Array.from({ length: Math.min(form.stampsRequired, 10) }).map((_, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                      style={i < 5 ? { background: form.cardAccentColor, color: "#000" } : { border: `2px solid ${form.cardFgColor}33` }}>
                      {i < 5 ? "★" : ""}
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: form.cardFgColor + "99" }}>Récompense : {form.rewardLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "Enregistrement..." : saved ? "✓ Enregistré !" : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
