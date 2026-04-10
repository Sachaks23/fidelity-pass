"use client";
import { useState, useEffect } from "react";


const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-colors focus:outline-none";
const inputStyle = { background: "var(--surface-2)", border: "1px solid var(--border)" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{title}</p>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1.5">{label}</label>
      {hint && <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{hint}</p>}
      {children}
    </div>
  );
}

export default function ParametresPage() {
  const [business, setBusiness] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    fetch("/api/business").then((r) => r.json()).then((b) => {
      setBusiness(b);
      setForm({
        name: b.name, address: b.address || "", phone: b.phone || "",
        description: b.description || "", cardBgColor: b.cardBgColor,
        cardFgColor: b.cardFgColor, cardAccentColor: b.cardAccentColor,
        stampsRequired: b.stampsRequired, rewardLabel: b.rewardLabel,
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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Paramètres</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Gérez les informations et le programme de fidélité</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Section title="Informations du commerce">
          <Field label="Nom du commerce">
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Adresse">
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} style={inputStyle} placeholder="123 rue de la Paix..." />
          </Field>
          <Field label="Téléphone">
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Description" hint="Décrit votre établissement sur la page d'inscription">
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              rows={3} className={inputClass + " resize-none"} style={inputStyle} placeholder="Bienvenue dans notre établissement..." />
          </Field>
        </Section>

        <Section title="Programme de fidélité">
          <Field label="Tampons pour une récompense" hint="Nombre de tampons nécessaires pour déclencher la récompense principale">
            <input type="number" min={1} max={50} value={form.stampsRequired}
              onChange={(e) => update("stampsRequired", parseInt(e.target.value))} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Libellé de la récompense">
            <input type="text" value={form.rewardLabel} onChange={(e) => update("rewardLabel", e.target.value)}
              className={inputClass} style={inputStyle} placeholder="Café offert, -10% de réduction..." />
          </Field>
        </Section>

        <button type="submit" disabled={saving}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
          style={saved
            ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
            : { background: "#f59e0b", color: "#000" }
          }
        >
          {saving ? "Enregistrement..." : saved ? "✓ Modifications enregistrées" : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
