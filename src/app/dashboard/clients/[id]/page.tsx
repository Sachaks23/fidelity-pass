"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: string;
  stampsDelta: number;
  note: string | null;
  createdAt: string;
}

interface CustomerDetail {
  id: string;
  serialNumber: string;
  stampCount: number;
  totalStamps: number;
  issuedAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string | null;
    user: { email: string; createdAt: string };
  };
  transactions: Transaction[];
  _count: { scanEvents: number };
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [id]);

  const typeLabel: Record<string, { label: string; color: string; icon: string }> = {
    STAMP: { label: "Tampon", color: "text-amber-400", icon: "⭐" },
    REWARD: { label: "Récompense", color: "text-green-400", icon: "🎁" },
    ADJUSTMENT: { label: "Ajustement", color: "text-blue-400", icon: "✏️" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Client non trouvé</p>
        <Link href="/dashboard/clients" className="text-amber-400 mt-4 block">← Retour</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/clients" className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {detail.customer.firstName} {detail.customer.lastName}
          </h1>
          <p className="text-slate-400 mt-1">Fiche client</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-slate-400 text-sm mb-1">Email</p>
          <p className="text-white font-medium">{detail.customer.user.email}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-slate-400 text-sm mb-1">Téléphone</p>
          <p className="text-white font-medium">{detail.customer.phone || "Non renseigné"}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-slate-400 text-sm mb-1">Inscrit le</p>
          <p className="text-white font-medium">{new Date(detail.issuedAt).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-slate-400 text-sm mb-1">Tampons actuels</p>
          <p className="text-4xl font-bold text-amber-400">{detail.stampCount}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-slate-400 text-sm mb-1">Total tampons cumulés</p>
          <p className="text-4xl font-bold text-white">{detail.totalStamps}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-slate-400 text-sm mb-1">Passages en caisse</p>
          <p className="text-4xl font-bold text-white">{detail._count.scanEvents}</p>
        </div>
      </div>

      {/* Serial for QR */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 mb-8">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Numéro de carte</p>
        <code className="text-amber-400 text-sm font-mono">{detail.serialNumber}</code>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Historique des transactions</h2>
        <div className="space-y-3">
          {detail.transactions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucune transaction</p>
          ) : detail.transactions.map((tx) => {
            const meta = typeLabel[tx.type] || { label: tx.type, color: "text-white", icon: "•" };
            return (
              <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                <span className="text-2xl">{meta.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${meta.color}`}>{meta.label}</p>
                  {tx.note && <p className="text-slate-400 text-sm">{tx.note}</p>}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.stampsDelta > 0 ? "text-amber-400" : "text-green-400"}`}>
                    {tx.stampsDelta > 0 ? `+${tx.stampsDelta}` : tx.stampsDelta}
                  </p>
                  <p className="text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
