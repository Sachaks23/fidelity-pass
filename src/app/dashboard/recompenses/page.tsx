"use client";
import { useState, useEffect } from "react";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
  isActive: boolean;
}

export default function RecompensesPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", pointsRequired: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", pointsRequired: "" });
  const [pointsPerEuro, setPointsPerEuro] = useState<number>(1);
  const [savingPPE, setSavingPPE] = useState(false);

  useEffect(() => {
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
    if (res.ok) {
      setForm({ name: "", description: "", pointsRequired: "" });
      await loadData();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette récompense ?")) return;
    await fetch(`/api/business/rewards/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function handleEdit(reward: Reward) {
    setEditId(reward.id);
    setEditForm({
      name: reward.name,
      description: reward.description ?? "",
      pointsRequired: String(reward.pointsRequired),
    });
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
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  if (loading) return <div className="text-slate-500 animate-pulse">Chargement...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">🎁 Récompenses</h1>
        <p className="text-slate-400 mt-1">Définissez les paliers de récompenses de votre programme de fidélité</p>
      </div>

      {/* Points per euro config */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">💶 Ratio de points</h2>
        <p className="text-slate-400 text-sm mb-4">Combien de points le client gagne-t-il par euro dépensé ?</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className={labelClass}>Points par euro (€)</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={pointsPerEuro}
              onChange={(e) => setPointsPerEuro(parseFloat(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="pt-7">
            <button
              onClick={handleSavePPE}
              disabled={savingPPE}
              className="px-6 py-3 rounded-xl gold-gradient text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {savingPPE ? "..." : "Enregistrer"}
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Ex: avec {pointsPerEuro} pt/€ → un achat de 20€ = {Math.round(20 * pointsPerEuro)} points
        </p>
      </div>

      {/* Rewards list */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">🏆 Paliers de récompenses</h2>
        {rewards.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-4xl mb-2">🎯</p>
            <p>Aucun palier défini. Ajoutez votre première récompense ci-dessous.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-xl border transition-all ${
                  reward.isActive
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-white/5 bg-white/2 opacity-50"
                }`}
              >
                {editId === reward.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                      placeholder="Nom de la récompense"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      className={inputClass}
                      placeholder="Description (optionnel)"
                    />
                    <input
                      type="number"
                      value={editForm.pointsRequired}
                      onChange={(e) => setEditForm((p) => ({ ...p, pointsRequired: e.target.value }))}
                      className={inputClass}
                      placeholder="Points requis"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2 rounded-lg gold-gradient text-black text-sm font-bold">
                        Sauvegarder
                      </button>
                      <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 font-bold text-sm">{reward.pointsRequired}</span>
                      <span className="text-amber-400 text-xs ml-0.5">pts</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{reward.name}</p>
                      {reward.description && (
                        <p className="text-slate-400 text-sm truncate">{reward.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(reward)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          reward.isActive
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-white/10 text-slate-400 hover:bg-white/20"
                        }`}
                      >
                        {reward.isActive ? "Actif" : "Inactif"}
                      </button>
                      <button
                        onClick={() => handleEdit(reward)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add reward form */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h2 className="text-lg font-bold text-white mb-4">➕ Ajouter un palier</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelClass}>Nom de la récompense *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass}
              placeholder="Ex: Café offert, -10% de réduction..."
            />
          </div>
          <div>
            <label className={labelClass}>Description (optionnel)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              placeholder="Précisions sur la récompense..."
            />
          </div>
          <div>
            <label className={labelClass}>Points requis *</label>
            <input
              type="number"
              min={1}
              value={form.pointsRequired}
              onChange={(e) => setForm((p) => ({ ...p, pointsRequired: e.target.value }))}
              className={inputClass}
              placeholder="Ex: 100"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.pointsRequired}
            className="w-full py-3 rounded-xl gold-gradient text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Ajout en cours..." : "Ajouter ce palier"}
          </button>
        </form>
      </div>
    </div>
  );
}
