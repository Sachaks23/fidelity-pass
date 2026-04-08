"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CardEntry {
  id: string;
  serialNumber: string;
  stampCount: number;
  totalStamps: number;
  issuedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    user: { email: string };
  };
  _count: { transactions: number };
}

export default function ClientsPage() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  const limit = 20;

  useEffect(() => {
    fetch("/api/business").then((r) => r.json()).then(setBusiness).catch(console.error);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Mes clients</h1>
          <p className="text-slate-400 mt-1">{total} client{total > 1 ? "s" : ""} inscrits</p>
        </div>
        {business && (
          <a
            href={`/rejoindre/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Page d&apos;inscription →
          </a>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher un client (nom, prénom, email)..."
          className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-6 py-4 text-slate-400 text-xs uppercase tracking-widest font-medium">Client</th>
              <th className="text-left px-6 py-4 text-slate-400 text-xs uppercase tracking-widest font-medium">Contact</th>
              <th className="text-left px-6 py-4 text-slate-400 text-xs uppercase tracking-widest font-medium">Tampons</th>
              <th className="text-left px-6 py-4 text-slate-400 text-xs uppercase tracking-widest font-medium">Inscrit le</th>
              <th className="text-left px-6 py-4 text-slate-400 text-xs uppercase tracking-widest font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Chargement...</td>
              </tr>
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  {search ? "Aucun client trouvé" : "Aucun client inscrit pour l'instant"}
                </td>
              </tr>
            ) : cards.map((card) => (
              <tr key={card.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black text-sm font-bold">
                      {card.customer.firstName[0]}{card.customer.lastName[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{card.customer.firstName} {card.customer.lastName}</p>
                      <p className="text-slate-500 text-xs">{card._count.transactions} transaction{card._count.transactions > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-300 text-sm">{card.customer.user.email}</p>
                  {card.customer.phone && <p className="text-slate-500 text-xs">{card.customer.phone}</p>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {business && Array.from({ length: Math.min(business.stampsRequired, 10) }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < card.stampCount ? "bg-amber-400" : "bg-white/10"}`} />
                      ))}
                    </div>
                    <span className="text-slate-300 text-sm">{card.stampCount}{business ? `/${business.stampsRequired}` : ""}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(card.issuedAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${card.id}`}
                    className="px-3 py-1 rounded-lg border border-white/20 text-slate-300 text-xs hover:bg-white/10 transition-colors"
                  >
                    Voir fiche →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-slate-400 text-sm">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} sur {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 disabled:opacity-40"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
