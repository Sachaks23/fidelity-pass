"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Promotion {
  id: string;
  name: string;
  multiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("STARTER");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", multiplier: "2", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const [promosData, planData] = await Promise.all([
      fetch("/api/promotions").then((r) => r.json()),
      fetch("/api/user/plan").then((r) => r.json()),
    ]);
    setPromos(Array.isArray(promosData) ? promosData : []);
    setPlan(planData.plan ?? "STARTER");
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", multiplier: "2", startDate: "", endDate: "" });
      await load();
    } else {
      setError(data.error || "Erreur");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  function isCurrentlyActive(promo: Promotion) {
    const now = Date.now();
    return promo.isActive && new Date(promo.startDate).getTime() <= now && new Date(promo.endDate).getTime() >= now;
  }

  function formatDateRange(start: string, end: string) {
    const s = new Date(start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const e = new Date(end).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    return `${s} → ${e}`;
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Promotions</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Multipliez les points gagnés pendant une période définie
          </p>
        </div>
        {plan === "PRO" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-black gold-gradient hover:opacity-90 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
            </svg>
            Nouvelle promotion
          </button>
        )}
      </div>

      {plan === "STARTER" && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Fonctionnalité Pro</p>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
            Créez des périodes de points doublés, triplés ou plus pour booster la fréquentation aux heures creuses ou durant des événements.
          </p>
          <Link href="/tarifs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black gold-gradient hover:opacity-90 transition-opacity">
            Passer Pro — 7 jours gratuits
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <polyline points="9 18 15 12 9 6" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      )}

      {/* Formulaire création */}
      {showForm && (
        <div className="rounded-xl p-5 mb-5" style={{ background: "var(--surface-1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Nouvelle promotion</p>
            <button onClick={() => setShowForm(false)} style={{ color: "var(--text-muted)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="rounded-lg px-3 py-2.5 mb-4 text-xs text-red-400" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Weekend double points"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white transition-colors"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Multiplicateur</label>
              <select
                value={form.multiplier}
                onChange={(e) => setForm((p) => ({ ...p, multiplier: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white transition-colors"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <option value="1.5">x1.5 — Points +50%</option>
                <option value="2">x2 — Points doublés</option>
                <option value="3">x3 — Points triplés</option>
                <option value="5">x5 — Points quintuplés</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Début</label>
                <input
                  type="date"
                  value={form.startDate}
                  min={todayStr}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Fin</label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || todayStr}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black gold-gradient hover:opacity-90 disabled:opacity-40 transition-opacity">
                {saving ? "..." : "Créer la promotion"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {promos.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune promotion créée</p>
          {plan === "PRO" && (
            <button onClick={() => setShowForm(true)} className="mt-3 text-xs" style={{ color: "#f59e0b" }}>
              Créer la première →
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid var(--border)" }}>
          {promos.map((promo, i) => {
            const active = isCurrentlyActive(promo);
            return (
              <div
                key={promo.id}
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background: active ? "rgba(245,158,11,0.04)" : "var(--surface-1)",
                  borderBottom: i < promos.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: active ? "rgba(245,158,11,0.15)" : "var(--surface-3)", color: active ? "#f59e0b" : "var(--text-muted)" }}
                  >
                    x{promo.multiplier}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{promo.name}</p>
                      {active && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#34d399", border: "1px solid rgba(34,197,94,0.2)" }}>
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatDateRange(promo.startDate, promo.endDate)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(promo.id)}
                  disabled={deleting === promo.id}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 disabled:opacity-40"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
                    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info parrainage */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" /><path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Parrainage automatique</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Points bonus offerts au parrain et au filleul</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
          Chaque client possède un code de parrainage unique (son numéro de carte). Quand un ami s&apos;inscrit via ce code, les deux reçoivent automatiquement des points bonus. Configurez le montant dans les <Link href="/dashboard/parametres" style={{ color: "#f59e0b" }}>Paramètres</Link>.
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Le code de parrainage est visible dans la fiche de chaque client.
        </p>
      </div>
    </div>
  );
}
