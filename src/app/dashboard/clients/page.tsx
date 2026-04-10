"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { segmentConfig, type Segment } from "@/lib/segmentation";

interface CardEntry {
  id: string;
  serialNumber: string;
  stampCount: number;
  totalStamps: number;
  points: number;
  totalPointsEarned: number;
  issuedAt: string;
  lastScanDate: string | null;
  segment: Segment;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    user: { email: string };
  };
  _count: { transactions: number; scanEvents: number };
}

export default function ClientsPage() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [plan, setPlan] = useState<string>("STARTER");

  const limit = 20;

  useEffect(() => {
    fetch("/api/business").then((r) => r.json()).then(setBusiness).catch(console.error);
    fetch("/api/user/plan").then(r => r.json()).then(d => setPlan(d.plan ?? "STARTER"));
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    setCards(data.cards || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const totalPages = Math.ceil(total / limit);

  function formatLastVisit(date: string | null) {
    if (!date) return "—";
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff}j`;
    return d.toLocaleDateString("fr-FR");
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Clients</h1>
          <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            {total} membre{total !== 1 ? "s" : ""} inscrits
            {plan === "STARTER" && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                {total}/30 — Starter
              </span>
            )}
          </p>
        </div>
        {business && (
          <a
            href={`/rejoindre/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-black gold-gradient hover:opacity-90 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" />
            </svg>
            Page d&apos;inscription
          </a>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-muted)" }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher un client..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-colors"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Client
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                Contact
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>
                Points
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>
                Dernière visite
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody style={{ background: "var(--surface-1)" }}>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8" style={{ color: "var(--text-muted)" }}>
                      <circle cx="9" cy="7" r="4" />
                      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {search ? "Aucun résultat pour cette recherche" : "Aucun client inscrit"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cards.map((card, i) => {
                const seg = segmentConfig[card.segment];
                return (
                  <tr
                    key={card.id}
                    className="transition-colors hover:bg-white/[0.025]"
                    style={{ borderBottom: i < cards.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                          {card.customer.firstName[0]}{card.customer.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white leading-tight">
                              {card.customer.firstName} {card.customer.lastName}
                            </p>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: seg.bg, color: seg.color, border: `1px solid ${seg.border}` }}
                            >
                              {seg.label}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {card._count.scanEvents} visite{card._count.scanEvents !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{card.customer.user.email}</p>
                      {card.customer.phone && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{card.customer.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>
                        {card.points ?? 0}
                      </span>
                      <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>pts</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {formatLastVisit(card.lastScanDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/dashboard/clients/${card.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                      >
                        Voir
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                          <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} sur {total}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
              style={{ background: "var(--surface-1)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
              style={{ background: "var(--surface-1)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
