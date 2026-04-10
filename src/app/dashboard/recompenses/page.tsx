"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
  isActive: boolean;
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-colors focus:outline-none";
const inputStyle = { background: "var(--surface-2)", border: "1px solid var(--border)" };

export default function RecompensesPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", pointsRequired: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", pointsRequired: "" });
  const [pointsPerEuro, setPointsPerEuro] = useState<number>(1);
  const [savingPPE, setSavingPPE] = useState(false);
  const [savedPPE, setSavedPPE] = useState(false);
  const [plan, setPlan] = useState<string>("STARTER");

  useEffect(() => {
    fetch("/api/user/plan").then(r => r.json()).then(d => setPlan(d.plan ?? "STARTER"));
    loadData();
  }, []);

  async function loadData() {
    const [rewardsRes, businessRes] = await Promise.all([
      fetch("/api/business/rewards"),
      fetch("/api/business"),
    ]);
    const rewardsData = await rewardsRes.json();
    const businessData = await businessRes.json();
    setRewards(Array.isArray(rewardsData) ? rewardsData : []);
    setPointsPerEuro(businessData.pointsPerEuro ?? 1);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.pointsRequired) return;
    setSaving(true);
    const res = await fetch("/api/business/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ name: "", description: "", pointsRequired: "" }); await loadData(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette récompense ?")) return;
    await fetch(`/api/business/rewards/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    await fetch(`/api/business/rewards/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditId(null);
    await loadData();
  }

  async function handleToggle(reward: Reward) {
    await fetch(`/api/business/rewards/${reward.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !reward.isActive }),
    });
    await loadData();
  }

  async function handleSavePPE() {
    setSavingPPE(true);
    await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pointsPerEuro }),
    });
    setSavingPPE(false);
    setSavedPPE(true);
    setTimeout(() => setSavedPPE(false), 2500);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Récompenses</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Définissez les paliers de récompenses de votre programme
        </p>
      </div>

      {/* Ratio de points */}
      <div className="rounded-xl p-5 mb-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Ratio de points
        </p>
        <p className="text-sm text-white font-medium mb-4">Points crédités par euro dépensé</p>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={pointsPerEuro}
                onChange={(e) => setPointsPerEuro(parseFloat(e.target.value))}
                className={inputClass}
                style={inputStyle}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>
                pt / €
              </span>
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
              20€ d&apos;achat = {Math.round(20 * pointsPerEuro)} points
            </p>
          </div>
          <button
            onClick={handleSavePPE}
            disabled={savingPPE}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={savedPPE
              ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
              : { background: "var(--surface-3)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }
          >
            {savedPPE ? "✓ Enregistré" : savingPPE ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Liste des paliers */}
      <div className="rounded-xl mb-4 overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Paliers — {rewards.length} défini{rewards.length > 1 ? "s" : ""}
          </p>
        </div>

        {rewards.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--surface-2)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" style={{ color: "var(--text-muted)" }}>
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" rx="1" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun palier défini. Ajoutez votre première récompense.
            </p>
          </div>
        ) : (
          <div>
            {rewards.map((reward, i) => (
              <div
                key={reward.id}
                className={`px-5 py-4 transition-colors ${!reward.isActive ? "opacity-40" : ""}`}
                style={{ borderBottom: i < rewards.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                {editId === reward.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-2.5">
                    <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} style={inputStyle} placeholder="Nom de la récompense" />
                    <input value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className={inputClass} style={inputStyle} placeholder="Description (optionnel)" />
                    <input type="number" value={editForm.pointsRequired} onChange={(e) => setEditForm((p) => ({ ...p, pointsRequired: e.target.value }))} className={inputClass} style={inputStyle} placeholder="Points requis" />
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className="px-3.5 py-2 rounded-lg text-xs font-bold gold-gradient text-black">Sauvegarder</button>
                      <button type="button" onClick={() => setEditId(null)} className="px-3.5 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Annuler</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <span className="text-sm font-bold leading-none" style={{ color: "#f59e0b" }}>{reward.pointsRequired}</span>
                      <span className="text-xs leading-none mt-0.5" style={{ color: "rgba(245,158,11,0.6)" }}>pts</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{reward.name}</p>
                      {reward.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{reward.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(reward)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                        style={reward.isActive
                          ? { background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }
                          : { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                        }
                      >
                        {reward.isActive ? "Actif" : "Inactif"}
                      </button>
                      <button
                        onClick={() => { setEditId(reward.id); setEditForm({ name: reward.name, description: reward.description ?? "", pointsRequired: String(reward.pointsRequired) }); }}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="p-1.5 rounded-md transition-colors hover:text-red-400"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" />
                          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ajouter un palier */}
      {plan === "STARTER" && rewards.length >= 1 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={1.75} className="w-5 h-5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-base font-semibold text-white mb-1">Récompenses illimitées — Pro uniquement</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            La formule Starter est limitée à 1 récompense. Passez à Pro pour en ajouter autant que vous voulez.
          </p>
          <Link
            href="/dashboard/abonnement"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold gold-gradient text-black hover:opacity-90 transition-opacity"
          >
            Passer à Pro — 7 jours gratuits
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      ) : (
      <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Ajouter un palier
        </p>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Nom de la récompense <span style={{ color: "#f59e0b" }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              style={inputStyle}
              placeholder="Café offert, -10% de réduction..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description <span style={{ color: "var(--text-muted)" }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              style={inputStyle}
              placeholder="Précisions sur la récompense..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Points requis <span style={{ color: "#f59e0b" }}>*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.pointsRequired}
              onChange={(e) => setForm((p) => ({ ...p, pointsRequired: e.target.value }))}
              className={inputClass}
              style={inputStyle}
              placeholder="100"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.pointsRequired}
            className="w-full py-2.5 rounded-lg text-sm font-semibold gold-gradient text-black hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Ajout en cours..." : "Ajouter ce palier"}
          </button>
        </form>
      </div>
      )}
    </div>
  );
}
